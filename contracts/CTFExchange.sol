// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CTFExchange
 * @notice 基于 Polymarket 架构的 Conditional Tokens 交易所
 * @dev 实现订单簿交易的链上结算部分
 * 
 * 架构说明：
 * - 订单在链下提交和匹配（CLOB）
 * - 链上仅处理最终结算
 * - 使用 EIP-712 签名验证订单
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./interfaces/IConditionalTokens.sol";

contract CTFExchange {
    using ECDSA for bytes32;

    // =============================================================
    //                     重入保护
    // =============================================================

    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    // =============================================================
    //                          常量
    // =============================================================

    /// @notice EIP-712 域分隔符类型哈希
    bytes32 public constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

    /// @notice 订单类型哈希
    bytes32 public constant ORDER_TYPEHASH = keccak256(
        "Order(uint256 salt,address maker,address signer,address taker,uint256 tokenId,uint256 makerAmount,uint256 takerAmount,uint256 expiration,uint256 nonce,uint256 feeRateBps,uint8 side,uint8 signatureType)"
    );

    /// @notice 协议名称
    string public constant NAME = "CTF Exchange";
    
    /// @notice 协议版本
    string public constant VERSION = "1.0";

    /// @notice 基点（用于手续费计算）
    uint256 public constant BPS = 10000;

    // =============================================================
    //                          枚举
    // =============================================================

    /// @notice 订单方向
    enum Side {
        BUY,   // 买入（用 Collateral 购买 Outcome Token）
        SELL   // 卖出（卖出 Outcome Token 获得 Collateral）
    }

    /// @notice 签名类型
    enum SignatureType {
        EOA,      // 外部账户签名
        POLY_PROXY, // Polymarket 代理签名
        POLY_GNOSIS_SAFE // Gnosis Safe 多签
    }

    // =============================================================
    //                          结构体
    // =============================================================

    /// @notice 订单结构
    struct Order {
        uint256 salt;           // 随机盐值（防重放）
        address maker;          // 订单创建者
        address signer;         // 签名者地址
        address taker;          // 指定接受者（0x0 表示任何人）
        uint256 tokenId;        // Outcome Token ID
        uint256 makerAmount;    // Maker 提供的数量
        uint256 takerAmount;    // Taker 需要提供的数量
        uint256 expiration;     // 过期时间戳
        uint256 nonce;          // 用户 nonce
        uint256 feeRateBps;     // 手续费率（基点）
        Side side;              // 订单方向
        SignatureType signatureType; // 签名类型
    }

    // =============================================================
    //                          状态变量
    // =============================================================

    /// @notice Conditional Tokens 合约
    IConditionalTokens public immutable ctf;

    /// @notice Collateral Token（如 USDC）
    IERC20 public immutable collateral;

    /// @notice EIP-712 域分隔符
    bytes32 public immutable domainSeparator;

    /// @notice 订单哈希 => 已填充数量
    mapping(bytes32 => uint256) public orderFills;

    /// @notice 订单哈希 => 是否已取消
    mapping(bytes32 => bool) public orderCancelled;

    /// @notice 用户 => nonce => 是否已使用
    mapping(address => mapping(uint256 => bool)) public nonces;

    /// @notice 协议手续费接收地址
    address public feeRecipient;

    /// @notice 管理员地址
    address public admin;

    /// @notice 是否暂停交易
    bool public paused;

    // =============================================================
    //                          事件
    // =============================================================

    event OrderFilled(
        bytes32 indexed orderHash,
        address indexed maker,
        address indexed taker,
        uint256 tokenId,
        uint256 makerAmount,
        uint256 takerAmount,
        uint256 fee
    );

    event OrderCancelled(bytes32 indexed orderHash);

    event NonceIncremented(address indexed user, uint256 newNonce);

    event PauseToggled(bool paused);

    event FeeRecipientUpdated(address indexed newFeeRecipient);

    // =============================================================
    //                          修饰符
    // =============================================================

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Exchange is paused");
        _;
    }

    // =============================================================
    //                          构造函数
    // =============================================================

    constructor(
        address _ctf,
        address _collateral,
        address _feeRecipient
    ) {
        require(_ctf != address(0), "Invalid CTF address");
        require(_collateral != address(0), "Invalid collateral address");
        require(_feeRecipient != address(0), "Invalid fee recipient");

        ctf = IConditionalTokens(_ctf);
        collateral = IERC20(_collateral);
        feeRecipient = _feeRecipient;
        admin = msg.sender;
        _status = _NOT_ENTERED; // 初始化重入保护

        // 构建 EIP-712 域分隔符
        domainSeparator = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes(NAME)),
                keccak256(bytes(VERSION)),
                block.chainid,
                address(this)
            )
        );
    }

    // =============================================================
    //                          核心函数
    // =============================================================

    /**
     * @notice 填充订单（执行交易）
     * @param order 订单详情
     * @param signature 订单签名
     * @param fillAmount Taker 希望填充的数量
     */
    function fillOrder(
        Order memory order,
        bytes memory signature,
        uint256 fillAmount
    ) external nonReentrant whenNotPaused {
        // 验证订单
        bytes32 orderHash = _validateOrder(order, signature, fillAmount);

        // 计算实际交易数量
        uint256 makerFillAmount = (fillAmount * order.makerAmount) / order.takerAmount;
        uint256 takerFillAmount = fillAmount;

        // 计算手续费
        uint256 fee = (makerFillAmount * order.feeRateBps) / BPS;

        // 更新已填充数量
        orderFills[orderHash] += takerFillAmount;

        // 执行资产转移
        _executeTransfer(order, msg.sender, makerFillAmount, takerFillAmount, fee);

        emit OrderFilled(
            orderHash,
            order.maker,
            msg.sender,
            order.tokenId,
            makerFillAmount,
            takerFillAmount,
            fee
        );
    }

    /**
     * @notice 批量填充订单
     * @param orders 订单数组
     * @param signatures 签名数组
     * @param fillAmounts 填充数量数组
     */
    function fillOrders(
        Order[] memory orders,
        bytes[] memory signatures,
        uint256[] memory fillAmounts
    ) external nonReentrant whenNotPaused {
        require(
            orders.length == signatures.length && orders.length == fillAmounts.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < orders.length; i++) {
            // 验证订单
            bytes32 orderHash = _validateOrder(orders[i], signatures[i], fillAmounts[i]);

            // 计算实际交易数量
            uint256 makerFillAmount = (fillAmounts[i] * orders[i].makerAmount) / orders[i].takerAmount;
            uint256 takerFillAmount = fillAmounts[i];

            // 计算手续费
            uint256 fee = (makerFillAmount * orders[i].feeRateBps) / BPS;

            // 更新已填充数量
            orderFills[orderHash] += takerFillAmount;

            // 执行资产转移
            _executeTransfer(orders[i], msg.sender, makerFillAmount, takerFillAmount, fee);

            emit OrderFilled(
                orderHash,
                orders[i].maker,
                msg.sender,
                orders[i].tokenId,
                makerFillAmount,
                takerFillAmount,
                fee
            );
        }
    }

    /**
     * @notice 取消订单
     * @param order 订单详情
     */
    function cancelOrder(Order memory order) external {
        require(msg.sender == order.maker, "Only maker can cancel");

        bytes32 orderHash = _hashOrder(order);
        require(!orderCancelled[orderHash], "Order already cancelled");

        orderCancelled[orderHash] = true;

        emit OrderCancelled(orderHash);
    }

    /**
     * @notice 批量取消订单
     * @param orders 订单数组
     */
    function cancelOrders(Order[] memory orders) external {
        for (uint256 i = 0; i < orders.length; i++) {
            require(msg.sender == orders[i].maker, "Only maker can cancel");

            bytes32 orderHash = _hashOrder(orders[i]);
            if (!orderCancelled[orderHash]) {
                orderCancelled[orderHash] = true;
                emit OrderCancelled(orderHash);
            }
        }
    }

    /**
     * @notice 增加用户的 nonce（使所有旧订单失效）
     */
    function incrementNonce() external {
        uint256 newNonce = block.timestamp;
        nonces[msg.sender][newNonce] = true;
        emit NonceIncremented(msg.sender, newNonce);
    }

    // =============================================================
    //                          内部函数
    // =============================================================

    /**
     * @notice 验证订单
     */
    function _validateOrder(
        Order memory order,
        bytes memory signature,
        uint256 fillAmount
    ) internal view returns (bytes32) {
        // 计算订单哈希
        bytes32 orderHash = _hashOrder(order);

        // 检查订单是否已取消
        require(!orderCancelled[orderHash], "Order cancelled");

        // 检查是否过期
        require(block.timestamp <= order.expiration, "Order expired");

        // 检查 nonce
        if (order.nonce != 0) {
            require(nonces[order.maker][order.nonce], "Invalid nonce");
        }

        // 检查 taker
        if (order.taker != address(0)) {
            require(msg.sender == order.taker, "Invalid taker");
        }

        // 检查填充数量
        uint256 filled = orderFills[orderHash];
        require(filled + fillAmount <= order.takerAmount, "Fill amount exceeds remaining");

        // 验证签名
        bytes32 typedDataHash = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, orderHash)
        );
        address signer = typedDataHash.recover(signature);
        require(signer == order.signer, "Invalid signature");

        return orderHash;
    }

    /**
     * @notice 执行资产转移
     */
    function _executeTransfer(
        Order memory order,
        address taker,
        uint256 makerAmount,
        uint256 takerAmount,
        uint256 fee
    ) internal {
        if (order.side == Side.BUY) {
            // Maker 买入（用 Collateral 购买 Outcome Token）
            // Taker 卖出 Outcome Token，获得 Collateral

            // Taker 转移 Outcome Token 给 Maker
            ctf.safeTransferFrom(
                taker,
                order.maker,
                order.tokenId,
                makerAmount,
                ""
            );

            // Maker 支付 Collateral 给 Taker（减去手续费）
            require(
                collateral.transferFrom(order.maker, taker, takerAmount - fee),
                "Collateral transfer failed"
            );

            // 手续费转给协议
            if (fee > 0) {
                require(
                    collateral.transferFrom(order.maker, feeRecipient, fee),
                    "Fee transfer failed"
                );
            }
        } else {
            // Maker 卖出 Outcome Token，获得 Collateral
            // Taker 买入（用 Collateral 购买 Outcome Token）

            // Maker 转移 Outcome Token 给 Taker
            ctf.safeTransferFrom(
                order.maker,
                taker,
                order.tokenId,
                makerAmount - fee,
                ""
            );

            // 手续费（从 Maker 的 Outcome Token 中扣除）
            if (fee > 0) {
                ctf.safeTransferFrom(
                    order.maker,
                    feeRecipient,
                    order.tokenId,
                    fee,
                    ""
                );
            }

            // Taker 支付 Collateral 给 Maker
            require(
                collateral.transferFrom(taker, order.maker, takerAmount),
                "Collateral transfer failed"
            );
        }
    }

    /**
     * @notice 计算订单哈希
     */
    function _hashOrder(Order memory order) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                ORDER_TYPEHASH,
                order.salt,
                order.maker,
                order.signer,
                order.taker,
                order.tokenId,
                order.makerAmount,
                order.takerAmount,
                order.expiration,
                order.nonce,
                order.feeRateBps,
                order.side,
                order.signatureType
            )
        );
    }

    // =============================================================
    //                          查询函数
    // =============================================================

    /**
     * @notice 获取订单哈希
     */
    function getOrderHash(Order memory order) external pure returns (bytes32) {
        return _hashOrder(order);
    }

    /**
     * @notice 获取订单剩余可填充数量
     */
    function getOrderRemaining(Order memory order) external view returns (uint256) {
        bytes32 orderHash = _hashOrder(order);
        uint256 filled = orderFills[orderHash];
        return order.takerAmount > filled ? order.takerAmount - filled : 0;
    }

    /**
     * @notice 检查订单是否有效
     */
    function isOrderValid(
        Order memory order,
        bytes memory signature
    ) external view returns (bool) {
        bytes32 orderHash = _hashOrder(order);

        // 检查是否已取消
        if (orderCancelled[orderHash]) return false;

        // 检查是否过期
        if (block.timestamp > order.expiration) return false;

        // 检查是否已完全填充
        if (orderFills[orderHash] >= order.takerAmount) return false;

        // 验证签名
        bytes32 typedDataHash = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, orderHash)
        );
        address signer = typedDataHash.recover(signature);
        
        return signer == order.signer;
    }

    // =============================================================
    //                          管理函数
    // =============================================================

    /**
     * @notice 更新手续费接收地址
     */
    function setFeeRecipient(address _feeRecipient) external onlyAdmin {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }

    /**
     * @notice 暂停/恢复交易
     */
    function togglePause() external onlyAdmin {
        paused = !paused;
        emit PauseToggled(paused);
    }

    /**
     * @notice 转移管理员权限
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }
}


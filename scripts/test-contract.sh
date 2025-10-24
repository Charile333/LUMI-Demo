#!/bin/bash

# Conditional Tokens 合约测试脚本
# 用法: ./scripts/test-contract.sh [选项]

set -e

echo "🧪 Conditional Tokens 合约测试工具"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 显示菜单
show_menu() {
    echo "请选择测试方案:"
    echo ""
    echo "  ${GREEN}1${NC}) 只读测试 (免费，30秒)"
    echo "     - 验证合约可用性"
    echo "     - 测试查询功能"
    echo "     - 不消耗 Gas"
    echo ""
    echo "  ${GREEN}2${NC}) Fork 模式测试 (免费，2-5分钟)"
    echo "     - 模拟 BSC 环境"
    echo "     - 测试写入操作"
    echo "     - 估算 Gas 消耗"
    echo ""
    echo "  ${GREEN}3${NC}) 产品场景测试 (免费，5分钟)"
    echo "     - 测试实际业务场景"
    echo "     - Gas 消耗分析"
    echo "     - 批量创建模拟"
    echo ""
    echo "  ${GREEN}4${NC}) 完整测试套件 (免费，10分钟)"
    echo "     - 运行所有测试"
    echo "     - 生成详细报告"
    echo ""
    echo "  ${YELLOW}5${NC}) 真实网络测试 (需要 BNB，谨慎使用)"
    echo "     - 在 BSC 主网创建真实市场"
    echo "     - 消耗真实 Gas"
    echo "     - 需要配置私钥"
    echo ""
    echo "  ${BLUE}6${NC}) Gas 基准测试"
    echo "     - 测试不同选项数量的 Gas"
    echo "     - 生成性能报告"
    echo ""
    echo "  ${RED}0${NC}) 退出"
    echo ""
}

# 只读测试
run_readonly_test() {
    echo ""
    echo "${GREEN}▶ 运行只读测试...${NC}"
    echo "─────────────────────────────────────────────"
    npx hardhat test contracts/test/BSC-RealContract.test.js --grep "只读"
    echo ""
    echo "${GREEN}✓ 只读测试完成${NC}"
}

# Fork 模式测试
run_fork_test() {
    echo ""
    echo "${GREEN}▶ 运行 Fork 模式测试...${NC}"
    echo "─────────────────────────────────────────────"
    export FORK_BSC=true
    npx hardhat test contracts/test/BSC-RealContract.test.js
    echo ""
    echo "${GREEN}✓ Fork 测试完成${NC}"
}

# 产品场景测试
run_product_test() {
    echo ""
    echo "${GREEN}▶ 运行产品场景测试...${NC}"
    echo "─────────────────────────────────────────────"
    export FORK_BSC=true
    npx hardhat test contracts/test/ProductScenarios.test.js
    echo ""
    echo "${GREEN}✓ 产品场景测试完成${NC}"
}

# 完整测试
run_full_test() {
    echo ""
    echo "${GREEN}▶ 运行完整测试套件...${NC}"
    echo "─────────────────────────────────────────────"
    
    echo "${BLUE}[1/3] 本地合约测试${NC}"
    npx hardhat test contracts/test/ConditionalTokens.test.js
    
    echo ""
    echo "${BLUE}[2/3] 只读功能测试${NC}"
    npx hardhat test contracts/test/BSC-RealContract.test.js --grep "只读"
    
    echo ""
    echo "${BLUE}[3/3] 产品场景测试 (Fork 模式)${NC}"
    export FORK_BSC=true
    npx hardhat test contracts/test/ProductScenarios.test.js
    
    echo ""
    echo "${GREEN}✓ 完整测试套件完成${NC}"
}

# 真实网络测试
run_mainnet_test() {
    echo ""
    echo "${YELLOW}⚠️  警告：这将在 BSC 主网上创建真实交易${NC}"
    echo "${YELLOW}⚠️  这会消耗真实的 BNB！${NC}"
    echo ""
    
    # 检查 .env 文件
    if [ ! -f .env ]; then
        echo "${RED}❌ 错误：未找到 .env 文件${NC}"
        echo ""
        echo "请创建 .env 文件并添加以下内容:"
        echo "  PRIVATE_KEY=你的私钥"
        echo ""
        return 1
    fi
    
    # 确认
    read -p "确认要继续吗？(yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "${YELLOW}已取消${NC}"
        return 0
    fi
    
    echo ""
    echo "${GREEN}▶ 运行真实网络测试...${NC}"
    echo "─────────────────────────────────────────────"
    npx hardhat test contracts/test/BSC-RealContract.test.js --grep "创建" --network bscMainnet
    echo ""
    echo "${GREEN}✓ 真实网络测试完成${NC}"
}

# Gas 基准测试
run_benchmark_test() {
    echo ""
    echo "${GREEN}▶ 运行 Gas 基准测试...${NC}"
    echo "─────────────────────────────────────────────"
    export FORK_BSC=true
    npx hardhat test contracts/test/ProductScenarios.test.js --grep "性能基准"
    echo ""
    echo "${GREEN}✓ 基准测试完成${NC}"
}

# 主循环
while true; do
    show_menu
    read -p "请输入选项 (0-6): " choice
    
    case $choice in
        1)
            run_readonly_test
            ;;
        2)
            run_fork_test
            ;;
        3)
            run_product_test
            ;;
        4)
            run_full_test
            ;;
        5)
            run_mainnet_test
            ;;
        6)
            run_benchmark_test
            ;;
        0)
            echo ""
            echo "👋 再见！"
            exit 0
            ;;
        *)
            echo "${RED}❌ 无效选项，请重新选择${NC}"
            ;;
    esac
    
    echo ""
    echo "─────────────────────────────────────────────"
    read -p "按 Enter 键继续..."
    clear
done


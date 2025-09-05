/**
 * 批量取消关注脚本
 * 自动遍历多页内容并取消所有关注
 */
 
// 配置常量
const CONFIG = {
  CLICK_DELAY: 250,        // 点击间隔时间（毫秒）
  PAGE_SWITCH_DELAY: 1000, // 页面切换等待时间（毫秒）
  PAGE_LOAD_DELAY: 2000,   // 页面加载等待时间（毫秒）
  MAX_RETRY_COUNT: 3       // 最大重试次数
};
 
// 选择器常量
const SELECTORS = {
  FOLLOW_BUTTON: '.follow-btn__trigger',
  NEXT_PAGE_BUTTON: '#app > main > div.space-follow > div.follow-main > div.vui_pagenation.vui_pagenation--jump > div.vui_pagenation--btns > button:last-child',
  PREV_PAGE_BUTTON: '#app > main > div.space-follow > div.follow-main > div.vui_pagenation.vui_pagenation--btns > button:nth-child(1)'
};
 
/**
 * 延迟函数
 * @param {number} ms - 延迟时间（毫秒）
 * @returns {Promise} Promise对象
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
 
/**
 * 检查元素是否存在且可见
 * @param {string} selector - CSS选择器
 * @returns {Element|null} 返回元素或null
 */
function getVisibleElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`未找到元素: ${selector}`);
    return null;
  }
  
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || 
      element.disabled || element.offsetParent === null) {
    console.warn(`元素不可见或已禁用: ${selector}`);
    return null;
  }
  
  return element;
}
 
/**
 * 安全点击元素
 * @param {Element} element - 要点击的元素
 * @param {string} description - 操作描述
 * @returns {boolean} 点击是否成功
 */
function safeClick(element, description = '元素') {
  try {
    if (!element) {
      console.error(`无法点击${description}: 元素不存在`);
      return false;
    }
    
    element.click();
    console.log(`成功点击${description}`);
    return true;
  } catch (error) {
    console.error(`点击${description}时发生错误:`, error);
    return false;
  }
}
 
/**
 * 获取当前页面的关注按钮列表
 * @returns {NodeList} 关注按钮列表
 */
function getFollowButtons() {
  const buttons = document.querySelectorAll(SELECTORS.FOLLOW_BUTTON);
  console.log(`找到 ${buttons.length} 个关注按钮`);
  return buttons;
}
 
/**
 * 取消当前页面的所有关注
 * @returns {Promise<number>} 返回成功取消关注的数量
 */
async function unfollowCurrentPage() {
  const followButtons = getFollowButtons();
  let successCount = 0;
  
  if (followButtons.length === 0) {
    console.warn('当前页面没有找到关注按钮');
    return 0;
  }
  
  for (let i = 0; i < followButtons.length; i++) {
    const button = followButtons[i];
    
    // 检查按钮是否仍然存在且可点击
    if (button && button.offsetParent !== null) {
      if (safeClick(button, `第${i + 1}个关注按钮`)) {
        successCount++;
        await sleep(CONFIG.CLICK_DELAY);
      }
    } else {
      console.warn(`第${i + 1}个关注按钮已不可用`);
    }
  }
  
  console.log(`当前页面成功取消关注: ${successCount}/${followButtons.length}`);
  return successCount;
}
 
/**
 * 切换到下一页
 * @returns {Promise<boolean>} 切换是否成功
 */
async function goToNextPage() {
  console.log('准备切换到下一页...');
  
  // 先点击下一页按钮
  const nextButton = getVisibleElement(SELECTORS.NEXT_PAGE_BUTTON);
  if (!nextButton) {
    console.error('下一页按钮不可用，可能已到达最后一页');
    return false;
  }
  
  if (!safeClick(nextButton, '下一页按钮')) {
    return false;
  }
  
  await sleep(CONFIG.PAGE_SWITCH_DELAY);
  
  // 再点击上一页按钮（根据原代码逻辑）
  const prevButton = getVisibleElement(SELECTORS.PREV_PAGE_BUTTON);
  if (!prevButton) {
    console.error('上一页按钮不可用');
    return false;
  }
  
  if (!safeClick(prevButton, '上一页按钮')) {
    return false;
  }
  
  await sleep(CONFIG.PAGE_LOAD_DELAY);
  console.log('页面切换完成');
  return true;
}
 
/**
 * 主函数 - 批量取消关注
 * @param {number} maxPages - 要处理的最大页数
 */
async function batchUnfollow(maxPages = 1) {
  console.log(`开始批量取消关注，计划处理 ${maxPages} 页`);
  
  let totalUnfollowed = 0;
  let processedPages = 0;
  
  try {
    for (let currentPage = 0; currentPage < maxPages; currentPage++) {
      console.log(`\n=== 处理第 ${currentPage + 1} 页 ===`);
      
      // 取消当前页面的关注
      const unfollowedCount = await unfollowCurrentPage();
      totalUnfollowed += unfollowedCount;
      processedPages++;
      
      // 如果还有下一页需要处理
      if (currentPage < maxPages - 1) {
        const switchSuccess = await goToNextPage();
        if (!switchSuccess) {
          console.warn('无法切换到下一页，提前结束处理');
          break;
        }
      }
    }
    
    console.log(`\n=== 批量取消关注完成 ===`);
    console.log(`处理页数: ${processedPages}/${maxPages}`);
    console.log(`总计取消关注: ${totalUnfollowed} 个`);
    
  } catch (error) {
    console.error('批量取消关注过程中发生错误:', error);
  }
}
 
// 使用示例
// 处理5页内容
batchUnfollow(15);
 
// 如果要处理多页，可以这样调用：
// batchUnfollow(5); // 处理5页


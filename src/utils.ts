/**
 * 清理可能包含Markdown格式的JSON字符串
 * @param jsonString 可能包含Markdown格式的JSON字符串
 * @returns 清理后的JSON字符串
 */
export function cleanJsonString(jsonString: string): string {
    // 移除可能的Markdown代码块标记
    let cleaned = jsonString.trim();
  
    // 移除开头的```json、```、或其他代码块标记
    cleaned = cleaned.replace(/^```(\w*\n|\n)?/, '');
  
    // 移除结尾的```
    cleaned = cleaned.replace(/```$/, '');
  
    // 移除可能的注释
    cleaned = cleaned.replace(/\/\/.*/g, '');
  
    return cleaned.trim();
  }

// 文本分段
export function segmentText(text: string): string[] {
    // 按段落分割（空行分隔）
    const segments = text.split(/\n\s*\n/).filter(segment => segment.trim().length > 0);
    
    // 如果没有段落分隔，或者只有一个段落，可以考虑按句子分割
    if (segments.length <= 1 && text.length > 500) {
      return text.split(/(?<=[.!?。！？])\s+/).filter(segment => segment.trim().length > 0);
    }
    
    return segments;
  }
import { cleanJsonString, segmentText } from "./utils.js";

// 定义翻译质量评估中的问题类型接口
export interface TranslationIssue {
    type: string;
    description: string;
    originalText: string;
    translatedText: string;
    suggestion: string;
    start: number;
    end: number;
    reason: string;
  }
  
  // 定义翻译质量评估中的段落反馈接口
  export interface TranslationSegmentFeedback {
    segmentIndex: number;
    issues: TranslationIssue[];
  }

// 定义翻译质量评估响应接口
export interface TranslationEvaluationResponse {
    score: number;
    comments: string[];
    segmentScores: number[];
    segmentFeedbacks: TranslationSegmentFeedback[];
    originalSegments?: string[];
    translatedSegments?: string[];
  }

// 评估翻译质量的函数
export async function evaluateTranslationQuality(
    originalText: string,
    translatedText: string,
    detailedFeedback: boolean = false
  ): Promise<TranslationEvaluationResponse> {
    const baseUrl = process.env.TRANSLATION_BASE_URL;
    const apiKey = process.env.TRANSLATION_API_KEY;
    const model = process.env.TRANSLATION_MODEL;
  
    if (!baseUrl || !apiKey || !model) {
      throw new Error('缺少翻译API的环境变量配置');
    }
  
    // 构建评估提示词
    const prompt = `
  你是专业的翻译质量评估专家，请对以下翻译进行质量评估：
  
  原文：
  \`\`\`
  ${originalText}
  \`\`\`
  
  请你首先阅读上面的原文，制订一个评估翻译质量的策略，然后对比下面的译文：
  
  译文：
  \`\`\`
  ${translatedText}
  \`\`\`
  
  请从以下几个方面进行评估：
  1. 准确性：译文是否准确传达了原文的意思
  2. 流畅性：译文是否符合目标语言表达习惯
  3. 术语使用：专业术语的翻译是否准确
  4. 风格一致性：译文是否保持了原文的风格
  
  请按照以下格式返回评估结果：
  {
      "score": 评分（0-100分）,
      "comments": [
          "具体评价1",
          "具体评价2",
          ...
      ],
      "segmentScores": [
          段落1评分,
          段落2评分,
          ...
      ],
      "segmentFeedbacks": [
          {
              "segmentIndex": 段落索引,
              "issues": [
                  {
                      "type": "问题类型",
                      "description": "问题描述",
                      "originalText": "原文片段",
                      "translatedText": "译文片段",
                      "suggestion": "建议的翻译结果（直接输出修改后的文本，不要包含'改为'等指示词）",
                      "start": 起始位置,
                      "end": 结束位置,
                      "reason": "修改理由"
                  }
              ]
          }
      ]
  }
  
  请确保返回的是有效的JSON格式。
  ${!detailedFeedback ? '请保持评估简洁，不需要详细分析每个问题。' : '请提供详细的问题分析和具体改进建议。'}
  `;
  
    const messages = [
      { role: 'system', content: '你是一个专业的翻译质量评估专家。请严格按照要求的JSON格式返回评估结果。' },
      { role: 'user', content: prompt }
    ];
  
    try {
      // 调用 API
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages,
          temperature: 0.3, // 降低随机性，使评估更稳定
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json() as any;
        throw new Error(`API 请求失败: ${errorData.error?.message || response.statusText}`);
      }
  
      const data = await response.json() as {
        choices: [{
          message: {
            content: string;
          }
        }]
      };
  
      const result = data.choices[0]?.message?.content || '';
  
      try {
        // 处理可能存在的 Markdown 代码块标记
        let jsonContent = result;
        if (result.includes('```json')) {
          jsonContent = result.split('```json')[1].split('```')[0].trim();
        } else if (result.includes('```')) {
          jsonContent = result.split('```')[1].split('```')[0].trim();
        }
        
        console.log('处理后的评估内容:', jsonContent);
        const evaluationResult = JSON.parse(cleanJsonString(jsonContent));
        
        // 验证必要的字段
        if (!evaluationResult.score || !evaluationResult.comments || !evaluationResult.segmentScores) {
          throw new Error('评估结果缺少必要字段');
        }
        
        // 分割文本为段落
        const originalSegments = segmentText(originalText);
        const translatedSegments = segmentText(translatedText);
  
        // 构建并返回结果
        return {
          ...evaluationResult,
          originalSegments: originalSegments.map((segment, index) => `[${index + 1}] ${segment.trim()}`),
          translatedSegments: translatedSegments.map((segment, index) => `[${index + 1}] ${segment.trim()}`)
        };
      } catch (error) {
        console.error('解析评估结果失败:', error);
        console.error('原始内容:', result);
        throw new Error(`解析评估结果失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (error) {
      console.error('翻译质量评估失败:', error);
      throw new Error(`翻译质量评估失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
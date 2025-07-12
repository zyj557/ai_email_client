using System;
using Wino.Core.Domain.Enums;

namespace Wino.Core.Domain.Models.AI;

/// <summary>
/// AI邮件分析结果
/// </summary>
public class AIMailAnalysisResult
{
    /// <summary>
    /// 邮件唯一ID
    /// </summary>
    public Guid MailUniqueId { get; set; }
    
    /// <summary>
    /// 是否为垃圾邮件
    /// </summary>
    public bool IsSpam { get; set; }
    
    /// <summary>
    /// 邮件分类
    /// </summary>
    public AIMailCategory Category { get; set; }
    
    /// <summary>
    /// 重要性评分(0-5)
    /// </summary>
    public int ImportanceScore { get; set; }
    
    /// <summary>
    /// 分析时间
    /// </summary>
    public DateTime AnalyzedAt { get; set; }
    
    /// <summary>
    /// 分析置信度(0-1)
    /// </summary>
    public double Confidence { get; set; }
    
    /// <summary>
    /// 分析备注
    /// </summary>
    public string Notes { get; set; }
}
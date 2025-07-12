using System;
using Wino.Core.Domain.Enums;

namespace Wino.Core.Domain.Models.AI;

/// <summary>
/// AI邮件设置
/// </summary>
public class AIMailSettings
{
    /// <summary>
    /// 账户ID
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// 是否启用自动分类
    /// </summary>
    public bool AutoCategorizationEnabled { get; set; } = true;

    /// <summary>
    /// 是否启用垃圾邮件检测
    /// </summary>
    public bool SpamDetectionEnabled { get; set; } = true;

    /// <summary>
    /// 是否启用重要性评分
    /// </summary>
    public bool ImportanceScoringEnabled { get; set; } = true;

    /// <summary>
    /// 是否启用自动翻译
    /// </summary>
    public bool AutoTranslationEnabled { get; set; } = false;

    /// <summary>
    /// 是否启用智能回复
    /// </summary>
    public bool SmartReplyEnabled { get; set; } = true;

    /// <summary>
    /// 是否启用智能建议
    /// </summary>
    public bool SmartSuggestionsEnabled { get; set; } = true;

    /// <summary>
    /// 首选语言
    /// </summary>
    public AILanguage PreferredLanguage { get; set; } = AILanguage.Auto;

    /// <summary>
    /// 重要性阈值（1-5）
    /// </summary>
    public int ImportanceThreshold { get; set; } = 3;

    /// <summary>
    /// 垃圾邮件置信度阈值（0-1）
    /// </summary>
    public double SpamConfidenceThreshold { get; set; } = 0.8;

    /// <summary>
    /// 自动分类置信度阈值（0-1）
    /// </summary>
    public double AutoCategorizationConfidenceThreshold { get; set; } = 0.7;

    /// <summary>
    /// 是否启用批量处理
    /// </summary>
    public bool EnableBatchProcessing { get; set; } = true;

    /// <summary>
    /// 批量处理大小
    /// </summary>
    public int BatchProcessingSize { get; set; } = 50;

    /// <summary>
    /// 是否启用实时分析
    /// </summary>
    public bool EnableRealTimeAnalysis { get; set; } = true;

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 更新时间
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// AI功能使用统计
/// </summary>
public class AIFeatureUsageStatistics
{
    /// <summary>
    /// 账户ID
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// 自动分类使用次数
    /// </summary>
    public int AutoCategorizationUsageCount { get; set; }

    /// <summary>
    /// 垃圾邮件检测使用次数
    /// </summary>
    public int SpamDetectionUsageCount { get; set; }

    /// <summary>
    /// 重要性评分使用次数
    /// </summary>
    public int ImportanceScoringUsageCount { get; set; }

    /// <summary>
    /// 自动翻译使用次数
    /// </summary>
    public int AutoTranslationUsageCount { get; set; }

    /// <summary>
    /// 智能回复使用次数
    /// </summary>
    public int SmartReplyUsageCount { get; set; }

    /// <summary>
    /// 智能建议使用次数
    /// </summary>
    public int SmartSuggestionsUsageCount { get; set; }

    /// <summary>
    /// 总使用次数
    /// </summary>
    public int TotalUsageCount { get; set; }

    /// <summary>
    /// 最后更新时间
    /// </summary>
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// AI功能类型
/// </summary>
public enum AIFeatureType
{
    /// <summary>
    /// 自动分类
    /// </summary>
    AutoCategorization,

    /// <summary>
    /// 垃圾邮件检测
    /// </summary>
    SpamDetection,

    /// <summary>
    /// 重要性评分
    /// </summary>
    ImportanceScoring,

    /// <summary>
    /// 自动翻译
    /// </summary>
    AutoTranslation,

    /// <summary>
    /// 智能回复
    /// </summary>
    SmartReply,

    /// <summary>
    /// 智能建议
    /// </summary>
    SmartSuggestions
}
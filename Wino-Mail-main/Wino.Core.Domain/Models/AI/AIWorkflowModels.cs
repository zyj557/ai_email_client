#nullable enable
using System;
using Wino.Core.Domain.Models.AI;

namespace Wino.Core.Domain.Models.AI;

/// <summary>
/// AI邮件工作流结果
/// </summary>
public class AIMailWorkflowResult
{
    /// <summary>
    /// 邮件ID
    /// </summary>
    public Guid MailId { get; set; }

    /// <summary>
    /// 开始时间
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// 结束时间
    /// </summary>
    public DateTime EndTime { get; set; }

    /// <summary>
    /// 处理持续时间
    /// </summary>
    public TimeSpan ProcessingDuration { get; set; }

    /// <summary>
    /// 是否成功
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// 错误消息
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// 处理步骤
    /// </summary>
    public string[] ProcessingSteps { get; set; } = Array.Empty<string>();

    /// <summary>
    /// 是否完成分析
    /// </summary>
    public bool AnalysisCompleted { get; set; }

    /// <summary>
    /// 是否完成翻译
    /// </summary>
    public bool TranslationCompleted { get; set; }

    /// <summary>
    /// 翻译后的内容
    /// </summary>
    public string? TranslatedContent { get; set; }

    /// <summary>
    /// 是否生成建议
    /// </summary>
    public bool SuggestionsGenerated { get; set; }

    /// <summary>
    /// 生成的建议
    /// </summary>
    public AIMailSuggestion[] Suggestions { get; set; } = Array.Empty<AIMailSuggestion>();

    /// <summary>
    /// 是否生成回复选项
    /// </summary>
    public bool ReplyOptionsGenerated { get; set; }

    /// <summary>
    /// 回复选项
    /// </summary>
    public string[] ReplyOptions { get; set; } = Array.Empty<string>();
}

/// <summary>
/// AI批量工作流结果
/// </summary>
public class AIBatchWorkflowResult
{
    /// <summary>
    /// 账户ID
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// 开始时间
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// 结束时间
    /// </summary>
    public DateTime EndTime { get; set; }

    /// <summary>
    /// 处理持续时间
    /// </summary>
    public TimeSpan ProcessingDuration { get; set; }

    /// <summary>
    /// 是否成功
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// 错误消息
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// 批量大小
    /// </summary>
    public int BatchSize { get; set; }

    /// <summary>
    /// 总待处理邮件数
    /// </summary>
    public int TotalMailsToProcess { get; set; }

    /// <summary>
    /// 成功处理数量
    /// </summary>
    public int SuccessfullyProcessed { get; set; }

    /// <summary>
    /// 失败数量
    /// </summary>
    public int Failed { get; set; }

    /// <summary>
    /// 生成的建议
    /// </summary>
    public AIMailSuggestion[] GeneratedSuggestions { get; set; } = Array.Empty<AIMailSuggestion>();

    /// <summary>
    /// 处理成功率
    /// </summary>
    public double SuccessRate => TotalMailsToProcess > 0 ? (double)SuccessfullyProcessed / TotalMailsToProcess * 100 : 0;
}

/// <summary>
/// AI管理工作流结果
/// </summary>
public class AIManagementWorkflowResult
{
    /// <summary>
    /// 账户ID
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// 开始时间
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// 结束时间
    /// </summary>
    public DateTime EndTime { get; set; }

    /// <summary>
    /// 处理持续时间
    /// </summary>
    public TimeSpan ProcessingDuration { get; set; }

    /// <summary>
    /// 是否成功
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// 错误消息
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// 管理建议
    /// </summary>
    public AIMailSuggestion[] Suggestions { get; set; } = Array.Empty<AIMailSuggestion>();

    /// <summary>
    /// 自动执行的操作
    /// </summary>
    public AIMailAction[] AutoExecutedActions { get; set; } = Array.Empty<AIMailAction>();

    /// <summary>
    /// 自动执行的操作数量
    /// </summary>
    public int AutoExecutedCount => AutoExecutedActions.Length;

    /// <summary>
    /// 待用户确认的建议数量
    /// </summary>
    public int PendingUserConfirmationCount => Suggestions.Length - AutoExecutedCount;
}
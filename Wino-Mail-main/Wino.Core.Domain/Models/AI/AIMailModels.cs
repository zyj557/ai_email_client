#nullable enable
using System;
using Wino.Core.Domain.Enums;

namespace Wino.Core.Domain.Models.AI;

/// <summary>
/// AI邮件建议
/// </summary>
public class AIMailSuggestion
{
    /// <summary>
    /// 建议类型
    /// </summary>
    public AIMailSuggestionType Type { get; set; }

    /// <summary>
    /// 建议标题
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// 建议描述
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// 优先级
    /// </summary>
    public AIMailSuggestionPriority Priority { get; set; }

    /// <summary>
    /// 操作数据
    /// </summary>
    public object? ActionData { get; set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// AI邮件操作
/// </summary>
public class AIMailAction
{
    /// <summary>
    /// 操作类型
    /// </summary>
    public AIMailActionType Type { get; set; }

    /// <summary>
    /// 账户ID
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// 邮件ID数组
    /// </summary>
    public Guid[] MailIds { get; set; } = Array.Empty<Guid>();

    /// <summary>
    /// 目标文件夹ID（用于移动操作）
    /// </summary>
    public Guid? TargetFolderId { get; set; }

    /// <summary>
    /// 提醒时间（用于创建提醒）
    /// </summary>
    public DateTime? ReminderTime { get; set; }

    /// <summary>
    /// 操作参数
    /// </summary>
    public object? Parameters { get; set; }
}

/// <summary>
/// AI邮件统计
/// </summary>
public class AIMailStatistics
{
    /// <summary>
    /// 账户ID
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// 统计生成时间
    /// </summary>
    public DateTime GeneratedAt { get; set; }

    /// <summary>
    /// 总重要邮件数
    /// </summary>
    public int TotalImportantMails { get; set; }

    /// <summary>
    /// 总垃圾邮件数
    /// </summary>
    public int TotalSpamMails { get; set; }

    /// <summary>
    /// 总工作邮件数
    /// </summary>
    public int TotalWorkMails { get; set; }

    /// <summary>
    /// 总个人邮件数
    /// </summary>
    public int TotalPersonalMails { get; set; }

    /// <summary>
    /// 总财务邮件数
    /// </summary>
    public int TotalFinanceMails { get; set; }

    /// <summary>
    /// 总购物邮件数
    /// </summary>
    public int TotalShoppingMails { get; set; }

    /// <summary>
    /// 未读重要邮件数
    /// </summary>
    public int UnreadImportantMails { get; set; }

    /// <summary>
    /// 未读工作邮件数
    /// </summary>
    public int UnreadWorkMails { get; set; }

    /// <summary>
    /// 未读个人邮件数
    /// </summary>
    public int UnreadPersonalMails { get; set; }

    /// <summary>
    /// 今日重要邮件数
    /// </summary>
    public int TodayImportantMails { get; set; }

    /// <summary>
    /// 今日工作邮件数
    /// </summary>
    public int TodayWorkMails { get; set; }

    /// <summary>
    /// 今日垃圾邮件数
    /// </summary>
    public int TodaySpamMails { get; set; }

    /// <summary>
    /// 处理效率（百分比）
    /// </summary>
    public double ProcessingEfficiency { get; set; }
}

/// <summary>
/// AI邮件建议类型
/// </summary>
public enum AIMailSuggestionType
{
    /// <summary>
    /// 未读邮件清理
    /// </summary>
    UnreadMailsCleanup,

    /// <summary>
    /// 重要邮件关注
    /// </summary>
    ImportantMailsAttention,

    /// <summary>
    /// 垃圾邮件清理
    /// </summary>
    SpamCleanup,

    /// <summary>
    /// 工作邮件审查
    /// </summary>
    WorkMailsReview,

    /// <summary>
    /// 未回复邮件提醒
    /// </summary>
    UnrepliedMailsReminder,

    /// <summary>
    /// 邮件分类建议
    /// </summary>
    CategorizationSuggestion,

    /// <summary>
    /// 自动回复建议
    /// </summary>
    AutoReplySuggestion
}

/// <summary>
/// AI邮件建议优先级
/// </summary>
public enum AIMailSuggestionPriority
{
    /// <summary>
    /// 低优先级
    /// </summary>
    Low,

    /// <summary>
    /// 中等优先级
    /// </summary>
    Medium,

    /// <summary>
    /// 高优先级
    /// </summary>
    High,

    /// <summary>
    /// 紧急
    /// </summary>
    Urgent
}

/// <summary>
/// AI邮件操作类型
/// </summary>
public enum AIMailActionType
{
    /// <summary>
    /// 自动分类
    /// </summary>
    AutoCategorize,

    /// <summary>
    /// 标记为已读
    /// </summary>
    MarkAsRead,

    /// <summary>
    /// 移动到文件夹
    /// </summary>
    MoveToFolder,

    /// <summary>
    /// 删除垃圾邮件
    /// </summary>
    DeleteSpam,

    /// <summary>
    /// 归档旧邮件
    /// </summary>
    ArchiveOld,

    /// <summary>
    /// 创建提醒
    /// </summary>
    CreateReminder,

    /// <summary>
    /// 自动回复
    /// </summary>
    AutoReply
}

/// <summary>
/// AI报告类型
/// </summary>
public enum AIReportType
{
    /// <summary>
    /// 日报
    /// </summary>
    Daily,

    /// <summary>
    /// 周报
    /// </summary>
    Weekly,

    /// <summary>
    /// 月报
    /// </summary>
    Monthly
}
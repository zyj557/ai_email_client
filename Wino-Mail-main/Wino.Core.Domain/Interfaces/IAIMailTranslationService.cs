using System.Threading.Tasks;
using Wino.Core.Domain.Entities.Mail;
using Wino.Core.Domain.Enums;

namespace Wino.Core.Domain.Interfaces;

/// <summary>
/// AI邮件翻译和自动回复服务接口
/// </summary>
public interface IAIMailTranslationService
{
    /// <summary>
    /// 翻译邮件内容
    /// </summary>
    /// <param name="mail">邮件对象</param>
    /// <param name="targetLanguage">目标语言</param>
    /// <returns>翻译后的内容</returns>
    Task<string> TranslateMailContentAsync(MailCopy mail, AILanguage targetLanguage);

    /// <summary>
    /// 翻译邮件主题
    /// </summary>
    /// <param name="mail">邮件对象</param>
    /// <param name="targetLanguage">目标语言</param>
    /// <returns>翻译后的主题</returns>
    Task<string> TranslateMailSubjectAsync(MailCopy mail, AILanguage targetLanguage);

    /// <summary>
    /// 生成自动回复内容
    /// </summary>
    /// <param name="originalMail">原始邮件</param>
    /// <param name="replyLanguage">回复语言</param>
    /// <returns>自动回复内容</returns>
    Task<string> GenerateAutoReplyAsync(MailCopy originalMail, AILanguage replyLanguage);

    /// <summary>
    /// 生成智能回复建议
    /// </summary>
    /// <param name="originalMail">原始邮件</param>
    /// <param name="replyLanguage">回复语言</param>
    /// <returns>回复选项数组</returns>
    Task<string[]> GenerateReplyOptionsAsync(MailCopy originalMail, AILanguage replyLanguage);

    /// <summary>
    /// 检测邮件语言
    /// </summary>
    /// <param name="mail">邮件对象</param>
    /// <returns>检测到的语言</returns>
    AILanguage DetectMailLanguage(MailCopy mail);
}
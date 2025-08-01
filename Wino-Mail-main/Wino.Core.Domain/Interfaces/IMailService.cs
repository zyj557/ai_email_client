using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MailKit;
using Wino.Core.Domain.Entities.Mail;
using Wino.Core.Domain.Entities.Shared;
using Wino.Core.Domain.Enums;
using Wino.Core.Domain.Models.MailItem;

namespace Wino.Core.Domain.Interfaces;

public interface IMailService
{
    Task<MailCopy> GetSingleMailItemAsync(string mailCopyId, string remoteFolderId);
    Task<MailCopy> GetSingleMailItemAsync(Guid uniqueMailId);

    /// <summary>
    /// Returns the single mail item with the given mail copy id.
    /// Caution: This method is not safe. Use other overrides.
    /// </summary>
    Task<MailCopy> GetSingleMailItemAsync(string mailCopyId);

    /// <summary>
    /// Returns the multiple mail item with the given mail copy ids.
    /// Caution: This method is not safe. Use other overrides.
    /// </summary>
    Task<List<MailCopy>> GetMailItemsAsync(IEnumerable<string> mailCopyIds);
    Task<List<IMailItem>> FetchMailsAsync(MailListInitializationOptions options, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes all mail copies for all folders.
    /// </summary>
    /// <param name="accountId">Account to remove from</param>
    /// <param name="mailCopyId">Mail copy id to remove.</param>
    Task DeleteMailAsync(Guid accountId, string mailCopyId);

    Task ChangeReadStatusAsync(string mailCopyId, bool isRead);
    Task ChangeFlagStatusAsync(string mailCopyId, bool isFlagged);

    Task CreateAssignmentAsync(Guid accountId, string mailCopyId, string remoteFolderId);
    Task DeleteAssignmentAsync(Guid accountId, string mailCopyId, string remoteFolderId);

    Task<bool> CreateMailAsync(Guid accountId, NewMailItemPackage package);

    /// <summary>
    /// Maps new mail item with the existing local draft copy.
    /// In case of failure, it returns false.
    /// Then synchronizers must insert a new mail item.
    /// </summary>
    /// <param name="accountId">Id of the account. It's important to map to the account since if the user use the same account with different providers, this call must map the correct one.</param>
    /// <param name="localDraftCopyUniqueId">UniqueId of the local draft copy.</param>
    /// <param name="newMailCopyId">New assigned remote mail item id.</param>
    /// <param name="newDraftId">New assigned draft id if exists.</param>
    /// <param name="newThreadId">New message's thread/conversation id.</param>
    /// <returns>True if mapping is done. False if local copy doesn't exists.</returns>
    Task<bool> MapLocalDraftAsync(Guid accountId, Guid localDraftCopyUniqueId, string newMailCopyId, string newDraftId, string newThreadId);

    /// <summary>
    /// Maps new mail item with the existing local draft copy.
    /// </summary>
    /// <param name="newMailCopyId"></param>
    /// <param name="newDraftId"></param>
    /// <param name="newThreadId"></param>
    Task MapLocalDraftAsync(string newMailCopyId, string newDraftId, string newThreadId);

    Task UpdateMailAsync(MailCopy mailCopy);

    /// <summary>
    /// Gets the new inserted unread mails after the synchronization.
    /// </summary>
    /// <param name="accountId">Account id.</param>
    /// <param name="downloadedMailCopyIds">
    /// Mail ids that synchronizer tried to download. If there was an issue with the
    /// Items that tried and actually downloaded may differ. This function will return only new inserted ones.
    /// </param>
    /// <returns>Newly inserted unread mails inside the Inbox folder.</returns>
    Task<List<MailCopy>> GetDownloadedUnreadMailsAsync(Guid accountId, IEnumerable<string> downloadedMailCopyIds);

    /// <summary>
    /// Returns the account that this mail copy unique id is assigned.
    /// Used in toast notification handler.
    /// </summary>
    /// <param name="uniqueMailId">Unique id of the mail item.</param>
    /// <returns>Account that mail belongs to.</returns>
    Task<MailAccount> GetMailAccountByUniqueIdAsync(Guid uniqueMailId);

    /// <summary>
    /// Checks whether the given mail copy id exists in the database.
    /// Safely used for Outlook to prevent downloading the same mail twice.
    /// For Gmail, it should be avoided since one mail may belong to multiple folders.
    /// </summary>
    /// <param name="mailCopyId">Native mail id of the message.</param>
    Task<bool> IsMailExistsAsync(string mailCopyId);

    /// <summary>
    /// Checks whether the given mail copy ids exists in the database.
    /// Safely used for Outlook to prevent downloading the same mail twice.
    /// For Gmail, it should be avoided since one mail may belong to multiple folders.
    /// </summary>
    /// <param name="mailCopyIds">Native mail id of the messages.</param>
    /// <returns>List of Mail ids that already exists in the database.</returns>
    Task<List<string>> AreMailsExistsAsync(IEnumerable<string> mailCopyIds);

    /// <summary>
    /// Returns all mails for given folder id.
    /// </summary>
    /// <param name="folderId">Folder id to get mails for</param>
    Task<List<MailCopy>> GetMailsByFolderIdAsync(Guid folderId);

    /// <summary>
    /// Returns all unread mails for given folder id.
    /// </summary>
    /// <param name="folderId">Folder id to get unread mails for.</param>
    Task<List<MailCopy>> GetUnreadMailsByFolderIdAsync(Guid folderId);

    /// <summary>
    /// Checks whether the mail exists in the folder.
    /// When deciding Create or Update existing mail, we need to check if the mail exists in the folder.
    /// </summary>
    /// <param name="mailCopyId">MailCopy id</param>
    /// <param name="folderId">Folder's local id.</param>
    /// <returns>Whether mail exists in the folder or not.</returns>
    Task<bool> IsMailExistsAsync(string mailCopyId, Guid folderId);

    /// <summary>
    /// Creates a draft MailCopy and MimeMessage based on the given options.
    /// For forward/reply it would include the referenced message.
    /// </summary>
    /// <param name="accountId">AccountId which should have new draft.</param>
    /// <param name="draftCreationOptions">Options like new email/forward/draft.</param>
    /// <returns>Draft MailCopy and Draft MimeMessage as base64.</returns>
    Task<(MailCopy draftMailCopy, string draftBase64MimeMessage)> CreateDraftAsync(Guid accountId, DraftCreationOptions draftCreationOptions);

    /// <summary>
    /// Returns ids 
    /// </summary>
    /// <param name="folderId"></param>
    /// <param name="uniqueIds"></param>
    /// <returns></returns>
    Task<List<MailCopy>> GetExistingMailsAsync(Guid folderId, IEnumerable<UniqueId> uniqueIds);

    /// <summary>
    /// Creates a new mail from a package without doing any existence check.
    /// Use it with caution.
    /// </summary>
    /// <param name="account">Account that mail belongs to.</param>
    /// <param name="mailItemFolder">Assigned folder.</param>
    /// <param name="package">Mail creation package.</param>
    /// <returns></returns>
    Task CreateMailRawAsync(MailAccount account, MailItemFolder mailItemFolder, NewMailItemPackage package);

    /// <summary>
    /// Checks whether the account has any draft mail locally.
    /// </summary>
    /// <param name="accountId">Account id.</param>
    Task<bool> HasAccountAnyDraftAsync(Guid accountId);

    /// <summary>
    /// Compares the ids returned from online search result for Archive folder against the local database.
    /// </summary>
    /// <param name="archiveFolderId">Archive folder id.</param>
    /// <param name="onlineArchiveMailIds">Retrieved MailCopy ids from search result.</param>
    /// <returns>Result model that contains added and removed mail copy ids.</returns>
    Task<GmailArchiveComparisonResult> GetGmailArchiveComparisonResultAsync(Guid archiveFolderId, List<string> onlineArchiveMailIds);

    #region AI Analysis Methods

    /// <summary>
    /// 获取指定账户的所有未分析邮件
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <returns>未分析的邮件列表</returns>
    Task<List<MailCopy>> GetUnanalyzedMailsAsync(Guid accountId);

    /// <summary>
    /// 获取单个邮件
    /// </summary>
    /// <param name="mailId">邮件ID</param>
    /// <returns>邮件实体</returns>
    Task<MailCopy> GetMailAsync(string mailId);

    /// <summary>
    /// 根据AI分类获取邮件
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <param name="category">AI分类</param>
    /// <returns>指定分类的邮件列表</returns>
    Task<List<MailCopy>> GetMailsByCategoryAsync(Guid accountId, AIMailCategory category);

    /// <summary>
    /// 获取重要邮件（AI评分>=4星）
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <returns>重要邮件列表</returns>
    Task<List<MailCopy>> GetImportantMailsAsync(Guid accountId);

    /// <summary>
    /// 获取垃圾邮件
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <returns>垃圾邮件列表</returns>
    Task<List<MailCopy>> GetSpamMailsAsync(Guid accountId);

    #endregion
}

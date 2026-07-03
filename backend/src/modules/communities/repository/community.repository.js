const BaseRepository = require('../../../common/repository/base.repository');
const Community = require('../model/Community');
const CommunityMember = require('../model/CommunityMember');
const CommunityInvitation = require('../model/CommunityInvitation');
const CommunityPost = require('../model/CommunityPost');
const CommunityComment = require('../model/CommunityComment');
const CommunityDiscussion = require('../model/CommunityDiscussion');
const CommunityFile = require('../model/CommunityFile');
const CommunityEvent = require('../model/CommunityEvent');
const CommunityJob = require('../model/CommunityJob');
const CommunityAnnouncement = require('../model/CommunityAnnouncement');
const CommunityMessage = require('../model/CommunityMessage');

class CommunityRepository extends BaseRepository {
  constructor() { super(Community); }
}
class CommunityMemberRepository extends BaseRepository {
  constructor() { super(CommunityMember); }
}
class CommunityInvitationRepository extends BaseRepository {
  constructor() { super(CommunityInvitation); }
}
class CommunityPostRepository extends BaseRepository {
  constructor() { super(CommunityPost); }
}
class CommunityCommentRepository extends BaseRepository {
  constructor() { super(CommunityComment); }
}
class CommunityDiscussionRepository extends BaseRepository {
  constructor() { super(CommunityDiscussion); }
}
class CommunityFileRepository extends BaseRepository {
  constructor() { super(CommunityFile); }
}
class CommunityEventRepository extends BaseRepository {
  constructor() { super(CommunityEvent); }
}
class CommunityJobRepository extends BaseRepository {
  constructor() { super(CommunityJob); }
}
class CommunityAnnouncementRepository extends BaseRepository {
  constructor() { super(CommunityAnnouncement); }
}
class CommunityMessageRepository extends BaseRepository {
  constructor() { super(CommunityMessage); }
}

module.exports = {
  communityRepository: new CommunityRepository(),
  communityMemberRepository: new CommunityMemberRepository(),
  communityInvitationRepository: new CommunityInvitationRepository(),
  communityPostRepository: new CommunityPostRepository(),
  communityCommentRepository: new CommunityCommentRepository(),
  communityDiscussionRepository: new CommunityDiscussionRepository(),
  communityFileRepository: new CommunityFileRepository(),
  communityEventRepository: new CommunityEventRepository(),
  communityJobRepository: new CommunityJobRepository(),
  communityAnnouncementRepository: new CommunityAnnouncementRepository(),
  communityMessageRepository: new CommunityMessageRepository()
};

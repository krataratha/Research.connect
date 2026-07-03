import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import communitiesService from '../services/communities.service';

export default function CommunityFeed({ communityId, isMember }) {
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState('');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts', communityId],
    queryFn: () => communitiesService.getPosts(communityId),
    select: (res) => res.data.data || [],
    enabled: !!communityId,
  });

  const postMutation = useMutation({
    mutationFn: () => communitiesService.createPost(communityId, { content: postContent }),
    onSuccess: () => {
      setPostContent('');
      queryClient.invalidateQueries(['community-posts', communityId]);
      toast.success('Post created!');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to post.'),
  });

  return (
    <div className="space-y-5">
      {/* Post Composer */}
      {isMember && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <textarea
            value={postContent}
            onChange={e => setPostContent(e.target.value)}
            placeholder="Share research, insights, or questions with your community..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:border-violet-500 focus:outline-none resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={() => postMutation.mutate()}
              disabled={!postContent.trim() || postMutation.isPending}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-all"
            >
              {postMutation.isPending ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && [...Array(3)].map((_, i) => (
        <div key={i} className="h-28 bg-gray-900 animate-pulse rounded-xl" />
      ))}

      {/* Post List */}
      {posts.map(post => (
        <PostCard key={post._id} post={post} communityId={communityId} isMember={isMember} />
      ))}

      {!isLoading && posts.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">📭</div>
          <p>No posts yet. Be the first to share!</p>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, communityId, isMember }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const author = post.authorId || {};

  const commentMutation = useMutation({
    mutationFn: () => communitiesService.createComment(post._id, { content: commentText }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries(['community-posts', communityId]);
    },
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      {/* Author */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
          {author.avatar ? <img src={author.avatar} alt="" className="w-full h-full object-cover" /> : (author.firstName?.charAt(0) || '?')}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{author.firstName} {author.lastName}</p>
          <p className="text-xs text-gray-500">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-800">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-xs text-gray-400 hover:text-violet-400 transition-colors"
        >
          💬 Comment
        </button>
      </div>

      {/* Comment Box */}
      {showComments && isMember && (
        <div className="mt-3 flex gap-2">
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
          />
          <button
            onClick={() => commentMutation.mutate()}
            disabled={!commentText.trim() || commentMutation.isPending}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold disabled:opacity-50 hover:bg-violet-700 transition-colors"
          >
            Reply
          </button>
        </div>
      )}
    </div>
  );
}

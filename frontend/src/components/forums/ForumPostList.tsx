'use client';

import { useState } from 'react';
import { ForumPostCard } from './ForumPostCard';
import { ForumEditor } from './ForumEditor';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-auth';
import { createForumPost } from '@/actions/forums';
import { useRouter } from 'next/navigation';
import type { ForumTopic, ForumPost } from '@/types/database';

interface ForumPostListProps {
  topic: ForumTopic;
  posts: ForumPost[];
  categorySlug: string;
}

export function ForumPostList({ topic, posts, categorySlug }: ForumPostListProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [showEditor, setShowEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitPost = async (content: string) => {
    if (!isAuthenticated || !user) {
      router.push(`/auth/login?redirect=/forums/${categorySlug}/${topic.slug}`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await createForumPost({
        topic_id: topic.id,
        content,
      });

      if (result.success) {
        setShowEditor(false);
        // Use router.refresh() with a small delay to prevent rapid refreshes
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        alert(result.error || 'Failed to post reply');
      }
    } catch (err) {
      alert('Failed to post reply');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // First post is the topic content
  const topicPost: ForumPost = {
    id: topic.id,
    topic_id: topic.id,
    user_id: topic.user_id,
    content: topic.content,
    is_edited: false,
    edited_at: null,
    likes_count: 0,
    is_solution: false,
    parent_post_id: null,
    created_at: topic.created_at,
    updated_at: topic.updated_at,
    user: topic.user,
    topic,
  };

  const allPosts = [topicPost, ...posts];

  return (
    <div className="space-y-6">
      {/* Posts */}
      {allPosts.map((post, index) => (
        <ForumPostCard
          key={post.id}
          post={post}
          isAuthor={user?.id === post.user_id}
          onLike={(postId) => {
            // TODO: Implement like functionality
            console.log('Like post:', postId);
          }}
          onEdit={(postId) => {
            // TODO: Implement edit functionality
            console.log('Edit post:', postId);
          }}
          onDelete={(postId) => {
            // TODO: Implement delete functionality
            console.log('Delete post:', postId);
          }}
        />
      ))}

      {/* Reply Editor */}
      {topic.is_locked ? (
        <Card className="bg-olive-800 border-olive-600">
          <CardContent className="py-8 text-center">
            <p className="text-cream-400">This topic is locked and no longer accepts new replies.</p>
          </CardContent>
        </Card>
      ) : isAuthenticated ? (
        showEditor ? (
          <ForumEditor
            onSubmit={handleSubmitPost}
            onCancel={() => setShowEditor(false)}
            placeholder="Write your reply..."
            submitLabel="Post Reply"
            cancelLabel="Cancel"
          />
        ) : (
          <Card className="bg-olive-800 border-olive-600">
            <CardContent className="py-6">
              <Button
                variant="primary"
                onClick={() => setShowEditor(true)}
                className="w-full"
              >
                Write a Reply
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="bg-olive-800 border-olive-600">
          <CardContent className="py-8 text-center">
            <p className="text-cream-400 mb-4">Please sign in to reply to this topic.</p>
            <Button
              variant="primary"
              onClick={() => router.push(`/auth/login?redirect=/forums/${categorySlug}/${topic.slug}`)}
            >
              Sign In to Reply
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

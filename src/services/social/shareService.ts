/**
 * Social Sharing Service
 *
 * Share achievements, game results, and progress to social media.
 * Features:
 * - Share to Twitter, Facebook, Instagram
 * - Generate share images
 * - Share links with metadata
 * - Achievement cards
 * - Game result cards
 */

import { Share } from 'react-native';
import * as Linking from 'expo-linking';

export interface ShareContent {
  title: string;
  message: string;
  url?: string;
  image?: string;
}

export type SharePlatform = 'native' | 'twitter' | 'facebook' | 'instagram' | 'whatsapp';

/**
 * Social Sharing Service
 */
export class ShareService {
  /**
   * Share achievement
   */
  async shareAchievement(achievement: {
    name: string;
    description: string;
    icon: string;
  }): Promise<void> {
    const content: ShareContent = {
      title: 'New Achievement Unlocked! 🏆',
      message: `I just unlocked "${achievement.name}" in Chess Learning!\n${achievement.description}\n\nJoin me in mastering chess!`,
      url: 'https://chess-learning.app', // Replace with actual app URL
    };

    await this.share(content);
  }

  /**
   * Share game result
   */
  async shareGameResult(game: {
    result: 'win' | 'loss' | 'draw';
    opponentRating: number;
    playerColor: 'white' | 'black';
    moves: number;
    accuracy: number;
  }): Promise<void> {
    let message = '';

    if (game.result === 'win') {
      message = `🎉 I just won a chess game!\n` +
        `Played as ${game.playerColor}\n` +
        `Opponent: ${game.opponentRating} ELO\n` +
        `Moves: ${game.moves}\n` +
        `Accuracy: ${game.accuracy}%\n\n` +
        `Improve your chess with Chess Learning!`;
    } else if (game.result === 'loss') {
      message = `Lost a tough game but learned a lot!\n` +
        `Played as ${game.playerColor}\n` +
        `Opponent: ${game.opponentRating} ELO\n` +
        `Moves: ${game.moves}\n` +
        `Accuracy: ${game.accuracy}%\n\n` +
        `Every game is a learning opportunity!`;
    } else {
      message = `Drew a close game!\n` +
        `Played as ${game.playerColor}\n` +
        `Opponent: ${game.opponentRating} ELO\n` +
        `Moves: ${game.moves}\n\n` +
        `Practicing with Chess Learning!`;
    }

    const content: ShareContent = {
      title: 'Chess Game Result',
      message,
      url: 'https://chess-learning.app',
    };

    await this.share(content);
  }

  /**
   * Share streak milestone
   */
  async shareStreak(streak: number): Promise<void> {
    const content: ShareContent = {
      title: `${streak}-Day Streak! 🔥`,
      message: `I've been training chess for ${streak} days in a row!\n\n` +
        `Consistency is key to improvement. Join me on Chess Learning!`,
      url: 'https://chess-learning.app',
    };

    await this.share(content);
  }

  /**
   * Share level up
   */
  async shareLevelUp(level: number, xp: number): Promise<void> {
    const content: ShareContent = {
      title: `Level ${level} Reached! ⭐`,
      message: `Just reached level ${level} with ${xp.toLocaleString()} XP!\n\n` +
        `Leveling up my chess skills one game at a time. 📈`,
      url: 'https://chess-learning.app',
    };

    await this.share(content);
  }

  /**
   * Share rating milestone
   */
  async shareRating(rating: number, change: number): Promise<void> {
    const emoji = change > 0 ? '📈' : '📉';
    const content: ShareContent = {
      title: `Chess Rating: ${rating} ${emoji}`,
      message: `My chess rating: ${rating} (${change > 0 ? '+' : ''}${change})\n\n` +
        `Training hard and seeing results! 🎯`,
      url: 'https://chess-learning.app',
    };

    await this.share(content);
  }

  /**
   * Share puzzle solving milestone
   */
  async sharePuzzleMilestone(count: number, accuracy: number): Promise<void> {
    const content: ShareContent = {
      title: `${count} Tactical Puzzles Solved! 🧩`,
      message: `Solved ${count} tactical puzzles with ${accuracy}% accuracy!\n\n` +
        `Sharpening my tactical vision with Chess Learning.`,
      url: 'https://chess-learning.app',
    };

    await this.share(content);
  }

  /**
   * Share to specific platform
   */
  async shareToplatform(content: ShareContent, platform: SharePlatform): Promise<void> {
    switch (platform) {
      case 'twitter':
        await this.shareToTwitter(content);
        break;
      case 'facebook':
        await this.shareToFacebook(content);
        break;
      case 'whatsapp':
        await this.shareToWhatsApp(content);
        break;
      default:
        await this.share(content);
    }
  }

  /**
   * Generic share using native share sheet
   */
  private async share(content: ShareContent): Promise<void> {
    try {
      const result = await Share.share({
        title: content.title,
        message: content.message,
        url: content.url,
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error: any) {
      console.error('Error sharing:', error);
      throw error;
    }
  }

  /**
   * Share to Twitter
   */
  private async shareToTwitter(content: ShareContent): Promise<void> {
    try {
      const text = encodeURIComponent(content.message);
      const url = encodeURIComponent(content.url || '');
      const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

      const supported = await Linking.canOpenURL(twitterUrl);
      if (supported) {
        await Linking.openURL(twitterUrl);
      } else {
        // Fallback to native share
        await this.share(content);
      }
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      throw error;
    }
  }

  /**
   * Share to Facebook
   */
  private async shareToFacebook(content: ShareContent): Promise<void> {
    try {
      const url = encodeURIComponent(content.url || '');
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

      const supported = await Linking.canOpenURL(facebookUrl);
      if (supported) {
        await Linking.openURL(facebookUrl);
      } else {
        await this.share(content);
      }
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      throw error;
    }
  }

  /**
   * Share to WhatsApp
   */
  private async shareToWhatsApp(content: ShareContent): Promise<void> {
    try {
      const text = encodeURIComponent(content.message);
      const whatsappUrl = `whatsapp://send?text=${text}`;

      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await this.share(content);
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Generate shareable image (requires canvas/image generation library)
   */
  async generateShareImage(data: {
    type: 'achievement' | 'game' | 'streak' | 'level';
    content: any;
  }): Promise<string> {
    // TODO: Implement image generation using react-native-view-shot or similar
    // For now, return placeholder
    console.log('Generating share image for:', data.type);
    return '';
  }

  /**
   * Check if platform is available
   */
  async isPlatformAvailable(platform: SharePlatform): Promise<boolean> {
    if (platform === 'native') return true;

    const urls: Record<SharePlatform, string> = {
      native: '',
      twitter: 'twitter://',
      facebook: 'fb://',
      instagram: 'instagram://',
      whatsapp: 'whatsapp://',
    };

    try {
      return await Linking.canOpenURL(urls[platform]);
    } catch {
      return false;
    }
  }
}

export const shareService = new ShareService();

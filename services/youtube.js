import axios from 'axios';
import { YOUTUBE_API_KEY } from '@env';

const API_KEY = YOUTUBE_API_KEY;
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const VIDEO_DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';

export const searchDJSets = async (djName, options = {}) => {
  const { signal } = options;

  if (!API_KEY) {
    console.error('❌ YOUTUBE_API_KEY is missing');
    return [];
  }

  try {
    // 🔁 Fetch multiple pages of search results
    const searchResults = [];
    let nextPageToken = null;
    let pageCount = 0;

    while (pageCount < 2) { // Fetch up to 50 results
      const { data } = await axios.get(SEARCH_URL, {
        signal,
        params: {
          part: 'snippet',
          q: djName,
          type: 'video',
          maxResults: 25,
          pageToken: nextPageToken,
          key: API_KEY,
        },
      });

      searchResults.push(...data.items);
      nextPageToken = data.nextPageToken;
      pageCount++;

      if (!nextPageToken) break;
    }

    const videoIds = searchResults
      .map(item => item.id.videoId)
      .filter(Boolean)
      .join(',');

    if (!videoIds) return [];

    const { data: detailsData } = await axios.get(VIDEO_DETAILS_URL, {
      signal,
      params: {
        part: 'contentDetails,snippet',
        id: videoIds,
        key: API_KEY,
      },
    });

    const blacklist = [
      'interview', 'reaction', 'review', 'recap', 'trailer', 'announcement',
      'podcast', 'tutorial', 'how to', 'preview', 'teaser', 'qa', 'q&a', 'shorts',
    ];

    const setKeywords = [
      'dj set', 'live set', 'boiler room', 'essential mix', 'full set', 'festival',
      'club set', 'music on', 'live from', 'circle', 'cercle', 'mixmag', 'sunset set',
      'b2b', 'open to close', 'marathon set', 'extended set', 'all night long',
      'sunset', 'performance', 'concert', 'afterparty', 'closing set', 'opening set',
    ];

    const normalize = str => str.toLowerCase().replace(/[^\w\s]/g, '');
    const lowerDJName = djName.toLowerCase();

    const isLikelySet = (title, channelTitle) => {
      const lowerTitle = normalize(title);
      const lowerChannel = normalize(channelTitle);
      const hasDJName = lowerTitle.includes(lowerDJName) || lowerChannel.includes(lowerDJName);
      const hasSetKeyword = setKeywords.some(k => lowerTitle.includes(k));
      const hasBlacklisted = blacklist.some(b => lowerTitle.includes(b));

      // 🔍 Optional: Log rejected items for debugging
      if (!hasDJName || !hasSetKeyword || hasBlacklisted) {
        console.log('❌ Skipped:', title);
      }

      return hasDJName && hasSetKeyword && !hasBlacklisted;
    };

    const longSets = detailsData.items.filter(video => {
      const duration = parseISO8601Duration(video.contentDetails.duration);
      const title = video.snippet.title;
      const channel = video.snippet.channelTitle;

      return duration >= 55 && isLikelySet(title, channel);
    });

    return longSets.map(video => ({
      id: video.id,
      title: video.snippet.title,
      videoId: video.id,
      thumbnail: video.snippet.thumbnails.high.url,
      publishDate: video.snippet.publishedAt,
    }));

  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn('❌ YouTube API request was aborted');
    } else {
      console.error('YouTube API error:', error.response?.data || error.message);
    }
    return [];
  }
};

const parseISO8601Duration = (duration) => {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match?.[1] || '0', 10);
  const minutes = parseInt(match?.[2] || '0', 10);
  const seconds = parseInt(match?.[3] || '0', 10);
  return Math.round(hours * 60 + minutes + seconds / 60);
};

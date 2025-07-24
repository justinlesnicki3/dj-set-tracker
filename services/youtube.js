import axios from 'axios';
import { YOUTUBE_API_KEY } from '@env';


const API_KEY = YOUTUBE_API_KEY;
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const  VIDEO_DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';

export const searchDJSets = async (djName, options = {}) => {

    const {signal} = options;

    if (!API_KEY) {
        console.error("❌ YOUTUBE_API_KEY is missing");
        return [];
    }

    try {
        
        const searchResponse = await axios.get(SEARCH_URL, {
            signal,
            params: {
                part: 'snippet',
                q: djName,
                type: 'video',
                maxResults: 25,
                key: API_KEY,
            },
        });

        const videoItems = searchResponse.data.items;
        const videoIds = videoItems
        .map(item => item.id.videoId)
        .filter(id => id)
        .join(',');

        if(!videoIds) return [];

        const detailsResponse = await axios.get(VIDEO_DETAILS_URL, {
            signal,
            params: {
                part: 'contentDetails,snippet',
                id: videoIds,
                key: API_KEY,
            },
        });

        const blacklist = ['interview', 'reaction', 'review', 'recap', 'trailer', 'announcement', 'podcast'];
        const setKeywords = ['live set', 'dj set', 'boiler room', 'essential mix', 'full set', 'stream', 'festival', 'club', 'LIVE', '@', 'at', 'Live', 'Set'];

        const isLikelySet = (title, channelTitle) => {
            const lowerTitle = title.toLowerCase();
            const hasDJName = new RegExp(`\\b${djName.toLowerCase()}\\b`).test(lowerTitle);
            const hasSetKeyword = setKeywords.some(k => lowerTitle.includes(k));
            const hasBlacklisted = blacklist.some(b => lowerTitle.includes(b));

        return hasDJName && hasSetKeyword && !hasBlacklisted;
    };

        const longSets = detailsResponse.data.items.filter(video => {
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
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    return hours * 60 + minutes;
};
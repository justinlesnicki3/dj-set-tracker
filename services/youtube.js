import axios from 'axios';
import { YOUTUBE_API_KEY } from '@env';


const API_KEY = YOUTUBE_API_KEY;
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const  VIDEO_DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';

export const searchDJSets = async (djName) => {
    try {
        //1. Search for videos with DJ's Name
        const searchResponse = await axios.get(SEARCH_URL, {
            params: {
                part: 'snippet',
                q: djName,
                type: 'video',
                maxResults: 25,
                key: API_KEY,
            },
        });

        const videoItems = searchResponse.data.items;
        const videoIds = videoItems.map(item => item.id.videoId).join(',');

        const detailsResponse = await axios.get(VIDEO_DETAILS_URL, {
            params: {
                part: 'contentDetails,snippet',
                id: videoIds,
                key: API_KEY,
            },
        });

        const longSets = detailsResponse.data.items.filter(video => {
            const duration = parseISO8601Duration(video.contentDetails.duration);
            const title = video.snippet.title.toLowerCase();
            return duration >= 50 && title.includes(djName.toLowerCase());
        });

        return longSets.map(video => ({
            id: video.id,
            title: video.snippet.title,
            videoId: video.id,
            thumbnail: video.snippet.thumbnails.high.url,
        }));

    } catch (error) {
        console.error('YouTube API error:', error.response?.data || error.message);
        return [];
    }
};

const parseISO8601Duration = (duration) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    return hours * 60 + minutes;
};
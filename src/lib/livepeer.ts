const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY;
const LIVEPEER_API_URL = "https://livepeer.com/api";

interface LivepeerStream {
  id: string;
  name: string;
  streamKey: string;
  playbackId: string;
  isActive: boolean;
  status: string;
}

export async function createLivepeerStream(name: string): Promise<LivepeerStream | null> {
  try {
    const response = await fetch(`${LIVEPEER_API_URL}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LIVEPEER_API_KEY}`,
      },
      body: JSON.stringify({
        name,
        record: false,
        profiles: [
          {
            name: "720p",
            bitrate: 2000000,
            fps: 30,
            width: 1280,
            height: 720,
          },
          {
            name: "480p",
            bitrate: 1000000,
            fps: 30,
            width: 854,
            height: 480,
          },
          {
            name: "360p",
            bitrate: 500000,
            fps: 30,
            width: 640,
            height: 360,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Livepeer create stream error:", error);
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      streamKey: data.streamKey,
      playbackId: data.playbackId,
      isActive: data.isActive,
      status: data.status,
    };
  } catch (error) {
    console.error("Livepeer API error:", error);
    return null;
  }
}

export async function getLivepeerStream(streamId: string): Promise<LivepeerStream | null> {
  try {
    const response = await fetch(`${LIVEPEER_API_URL}/stream/${streamId}`, {
      headers: {
        Authorization: `Bearer ${LIVEPEER_API_KEY}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      streamKey: data.streamKey,
      playbackId: data.playbackId,
      isActive: data.isActive,
      status: data.status,
    };
  } catch (error) {
    console.error("Livepeer API error:", error);
    return null;
  }
}

export async function getLivepeerStreamSessions(streamId: string): Promise<any[]> {
  try {
    const response = await fetch(`${LIVEPEER_API_URL}/stream/${streamId}/sessions`, {
      headers: {
        Authorization: `Bearer ${LIVEPEER_API_KEY}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Livepeer API error:", error);
    return [];
  }
}

export async function endLivepeerStream(streamId: string): Promise<boolean> {
  try {
    const response = await fetch(`${LIVEPEER_API_URL}/stream/${streamId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LIVEPEER_API_KEY}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Livepeer API error:", error);
    return false;
  }
}

export function getPlaybackUrl(playbackId: string): string {
  return `https://livepeer.com/playback/${playbackId}`;
}

export function getEmbedUrl(playbackId: string): string {
  return `https://livepeer.com/embed/${playbackId}`;
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Video, Play, Users, Calendar, Clock, Key, Copy, Monitor, X } from "lucide-react";

interface Stream {
  id: string;
  title: string;
  description?: string;
  status: string;
  streamUrl?: string;
  viewerUrl?: string;
  host: { id: string; name: string; image?: string };
  course?: { id: string; title: string };
  _count?: { viewers: number };
  startedAt?: string;
}

export default function LiveStreamPage() {
  const { data: session, status } = useSession();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [newStream, setNewStream] = useState({ title: "", description: "", courseId: "" });
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [activeStream, setActiveStream] = useState<Stream | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchStreams();
      fetchCourses();
    }
  }, [status]);

  const fetchStreams = async () => {
    try {
      const res = await fetch("/api/streams");
      if (res.ok) {
        const data = await res.json();
        setStreams(data);
        
        // Check if user is hosting a stream
        const userId = (session?.user as any)?.id;
        const hosting = data.find((s: Stream) => s.host.id === userId && s.status !== "ENDED");
        if (hosting) {
          setSelectedStream(hosting);
        }
      }
    } catch (error) {
      console.error("Error fetching streams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const createStream = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStream),
      });

      if (res.ok) {
        const stream = await res.json();
        setSelectedStream(stream);
        setShowCreateModal(false);
        setShowHostModal(true);
        fetchStreams();
        setNewStream({ title: "", description: "", courseId: "" });
      }
    } catch (error) {
      console.error("Error creating stream:", error);
    }
  };

  const startStream = async (streamId: string) => {
    try {
      await fetch(`/api/streams/${streamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      fetchStreams();
    } catch (error) {
      console.error("Error starting stream:", error);
    }
  };

  const endStream = async (streamId: string) => {
    try {
      await fetch(`/api/streams/${streamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end" }),
      });
      setActiveStream(null);
      fetchStreams();
    } catch (error) {
      console.error("Error ending stream:", error);
    }
  };

  const joinStream = async (stream: Stream) => {
    try {
      await fetch(`/api/streams/${stream.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join" }),
      });
      setActiveStream(stream);
    } catch (error) {
      console.error("Error joining stream:", error);
    }
  };

  const copyStreamKey = () => {
    if (selectedStream?.streamUrl) {
      navigator.clipboard.writeText(selectedStream.streamUrl);
    }
  };

  const canStream = () => {
    const role = (session?.user as any)?.role;
    return role === "ADMIN";
  };

  const isHost = (stream: Stream) => {
    const userId = (session?.user as any)?.id;
    return stream.host.id === userId;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-slate-400">Please log in to view streams</div>
      </div>
    );
  }

  const liveStreams = streams.filter((s) => s.status === "LIVE");
  const upcomingStreams = streams.filter((s) => s.status === "SCHEDULED");

  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom py-8">
        {/* Active Stream Player */}
        {activeStream && (
          <div className="mb-8 bg-slate-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-red-500/20 border-b border-red-500/30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white font-medium">Watching: {activeStream.title}</span>
              </div>
              <button
                onClick={() => setActiveStream(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={`https://livepeer.com/embed/${activeStream.viewerUrl?.split('/').pop()}?autoplay=true`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Live Streams</h1>
          {canStream() && !selectedStream && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Go Live
            </button>
          )}
        </div>

        {/* Host Control Panel */}
        {selectedStream && isHost(selectedStream) && (
          <div className="mb-8 bg-slate-800 rounded-lg p-4">
            <h2 className="text-white font-medium mb-4">Stream Controls</h2>
            <div className="flex items-center gap-4">
              {selectedStream.status === "SCHEDULED" && (
                <button
                  onClick={() => startStream(selectedStream.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Streaming
                </button>
              )}
              {selectedStream.status === "LIVE" && (
                <button
                  onClick={() => endStream(selectedStream.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  End Stream
                </button>
              )}
              <span className="text-slate-400">
                Status: <span className="text-white">{selectedStream.status}</span>
              </span>
            </div>
          </div>
        )}

        {/* Live Now */}
        {liveStreams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live Now
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveStreams.map((stream) => (
                <div key={stream.id} className="bg-slate-800 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-slate-700 flex items-center justify-center relative">
                    <Video className="w-12 h-12 text-red-500" />
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      LIVE
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium">{stream.title}</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Hosted by {stream.host.name}
                    </p>
                    {stream.course && (
                      <p className="text-slate-500 text-xs mt-1">
                        {stream.course.title}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className="flex items-center gap-1 text-slate-400 text-sm">
                        <Users className="w-4 h-4" />
                        {stream._count?.viewers || 0}
                      </span>
                      <button
                        onClick={() => joinStream(stream)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Watch
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcomingStreams.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Streams
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingStreams.map((stream) => (
                <div key={stream.id} className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-white font-medium">{stream.title}</h3>
                  {stream.description && (
                    <p className="text-slate-400 text-sm mt-1">{stream.description}</p>
                  )}
                  <p className="text-slate-500 text-sm mt-2">
                    Host: {stream.host.name}
                  </p>
                  {stream.course && (
                    <p className="text-slate-500 text-xs">
                      Course: {stream.course.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {streams.length === 0 && (
          <div className="text-center py-16">
            <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No live streams at the moment</p>
          </div>
        )}

        {/* Create Stream Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Create Stream</h2>
              <form onSubmit={createStream}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Title</label>
                    <input
                      type="text"
                      value={newStream.title}
                      onChange={(e) => setNewStream({ ...newStream, title: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Description</label>
                    <textarea
                      value={newStream.description}
                      onChange={(e) => setNewStream({ ...newStream, description: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Course (optional)</label>
                    <select
                      value={newStream.courseId}
                      onChange={(e) => setNewStream({ ...newStream, courseId: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2"
                    >
                      <option value="">No specific course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-slate-700 text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Host Instructions Modal */}
        {showHostModal && selectedStream && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold text-white mb-4">Start Streaming</h2>
              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Stream Key
                    </span>
                    <button
                      onClick={copyStreamKey}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <code className="text-white text-sm break-all">{selectedStream.streamUrl}</code>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    How to Stream
                  </h3>
                  <ol className="text-slate-400 text-sm space-y-2">
                    <li>1. Download <a href="https://obsproject.com" target="_blank" className="text-indigo-400 underline">OBS Studio</a> (free)</li>
                    <li>2. Open Settings → Stream</li>
                    <li>3. Select &quot;Livepeer&quot; as service</li>
                    <li>4. Paste the stream key above</li>
                    <li>5. Click &quot;Start Streaming&quot;</li>
                  </ol>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowHostModal(false)}
                  className="flex-1 bg-slate-700 text-white py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

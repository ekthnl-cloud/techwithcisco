"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, GripVertical, Upload, Image, Video, Loader2 } from "lucide-react";

interface Chapter {
  id?: string;
  title: string;
  imageUrl: string;
  position: number;
  lessons: Lesson[];
}

interface Lesson {
  id?: string;
  title: string;
  type: string;
  content: string;
  position: number;
}

interface CourseFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    prize: string;
    chapters: Chapter[];
  };
}

export function CourseForm({ initialData }: CourseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "0");
  const [prize, setPrize] = useState(initialData?.prize || "");
  const [chapters, setChapters] = useState<Chapter[]>(
    initialData?.chapters?.map(ch => ({
      ...ch,
      imageUrl: ch.imageUrl || ""
    })) || [{ title: "", imageUrl: "", position: 0, lessons: [] }]
  );
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState<number[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleChapterImageUpload = async (file: File, chapterIndex: number) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        const updated = [...chapters];
        updated[chapterIndex].imageUrl = data.url;
        setChapters(updated);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const addChapter = () => {
    setChapters([
      ...chapters,
      { title: "", imageUrl: "", position: chapters.length, lessons: [] },
    ]);
  };

  const updateChapter = (index: number, title: string) => {
    const updated = [...chapters];
    updated[index].title = title;
    setChapters(updated);
  };

  const updateChapterImage = (index: number, imageUrl: string) => {
    const updated = [...chapters];
    updated[index].imageUrl = imageUrl;
    setChapters(updated);
  };

  const handleVideoUpload = async (file: File, chapterIndex: number, lessonIndex: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "video");

    setUploadingVideo([...uploadingVideo, lessonIndex]);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.url) {
        const updated = [...chapters];
        updated[chapterIndex].lessons[lessonIndex].content = JSON.stringify({ url: data.url });
        setChapters(updated);
      } else if (data.configured === false) {
        alert("Cloudinary not configured. Please add your Cloudinary credentials to the .env file.");
      }
    } catch (error) {
      console.error("Video upload failed:", error);
    } finally {
      setUploadingVideo(uploadingVideo.filter(i => i !== lessonIndex));
    }
  };

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const addLesson = (chapterIndex: number) => {
    const updated = [...chapters];
    updated[chapterIndex].lessons.push({
      title: "",
      type: "VIDEO",
      content: "",
      position: updated[chapterIndex].lessons.length,
    });
    setChapters(updated);
  };

  const updateLesson = (
    chapterIndex: number,
    lessonIndex: number,
    field: keyof Lesson,
    value: string
  ) => {
    const updated = [...chapters];
    (updated[chapterIndex].lessons[lessonIndex] as any)[field] = value;
    setChapters(updated);
  };

  const removeLesson = (chapterIndex: number, lessonIndex: number) => {
    const updated = [...chapters];
    updated[chapterIndex].lessons = updated[chapterIndex].lessons.filter(
      (_, i) => i !== lessonIndex
    );
    setChapters(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        initialData ? `/api/courses/${initialData.id}` : "/api/courses",
        {
          method: initialData ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            imageUrl,
            price: parseFloat(price) || 0,
            prize,
            chapters: chapters.map((ch, i) => ({
              ...ch,
              position: i,
              lessons: ch.lessons.map((l, j) => ({ ...l, position: j })),
            })),
          }),
        }
      );

      if (res.ok) {
        router.push("/admin/courses");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/courses"
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <h1 className="text-3xl font-bold text-white">
          {initialData ? "Edit Course" : "Create Course"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Course Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2">Course Thumbnail</label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-24 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Course thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </button>
                  <p className="text-slate-400 text-sm mt-2">Or enter URL below</p>
                </div>
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... (image URL)"
                className="w-full mt-3 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-2">Price ($)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Prize/Certificate</label>
                <input
                  type="text"
                  value={prize}
                  onChange={(e) => setPrize(e.target.value)}
                  placeholder="Certificate of Completion"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Chapters & Lessons</h2>
            <button
              type="button"
              onClick={addChapter}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
            >
              <Plus className="w-4 h-4" />
              Add Chapter
            </button>
          </div>

          <div className="space-y-6">
            {chapters.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <GripVertical className="w-5 h-5 text-slate-500 mt-2" />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => updateChapter(chapterIndex, e.target.value)}
                      placeholder={`Chapter ${chapterIndex + 1} Title`}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="mt-3">
                      <label className="block text-slate-400 text-sm mb-2">Chapter Thumbnail</label>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-14 bg-slate-600 rounded overflow-hidden">
                          {chapter.imageUrl ? (
                            <img src={chapter.imageUrl} alt="Chapter" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleChapterImageUpload(file, chapterIndex);
                          }}
                          className="hidden"
                          id={`chapter-image-${chapterIndex}`}
                        />
                        <label
                          htmlFor={`chapter-image-${chapterIndex}`}
                          className="cursor-pointer flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                          Upload
                        </label>
                        <input
                          type="url"
                          value={chapter.imageUrl}
                          onChange={(e) => updateChapterImage(chapterIndex, e.target.value)}
                          placeholder="Or URL"
                          className="flex-1 bg-slate-600 border border-slate-500 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeChapter(chapterIndex)}
                    className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                <div className="ml-8 space-y-3">
                  {chapter.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lessonIndex}
                      className="bg-slate-600 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) =>
                            updateLesson(chapterIndex, lessonIndex, "title", e.target.value)
                          }
                          placeholder="Lesson Title"
                          className="flex-1 bg-slate-500 border border-slate-400 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <select
                          value={lesson.type}
                          onChange={(e) =>
                            updateLesson(
                              chapterIndex,
                              lessonIndex,
                              "type",
                              e.target.value
                            )
                          }
                          className="bg-slate-500 border border-slate-400 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="VIDEO">Video</option>
                          <option value="QUIZ">Quiz</option>
                          <option value="CODING">Coding</option>
                          <option value="READING">Reading</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeLesson(chapterIndex, lessonIndex)}
                          className="p-2 hover:bg-slate-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>

                      <div>
                        <textarea
                          value={lesson.content}
                          onChange={(e) =>
                            updateLesson(
                              chapterIndex,
                              lessonIndex,
                              "content",
                              e.target.value
                            )
                          }
                          placeholder={
                            lesson.type === "VIDEO"
                              ? '{"url": "https://..."}'
                              : lesson.type === "QUIZ"
                              ? '{"questions": [{"question": "...", "options": ["a", "b"], "correctAnswer": "a"}]}'
                              : lesson.type === "CODING"
                              ? '{"language": "python", "starterCode": "...", "tests": ["assert solution() == 42"]}'
                              : "Lesson content..."
                          }
                          rows={lesson.type === "READING" ? 6 : 3}
                          className="w-full bg-slate-500 border border-slate-400 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          disabled={lesson.type === "VIDEO" && !!lesson.content}
                        />
                        
                        {lesson.type === "VIDEO" && (
                          <div className="mt-2 flex items-center gap-3">
                            {lesson.content ? (
                              <div className="flex items-center gap-2 text-green-400 text-sm">
                                <Video className="w-4 h-4" />
                                Video uploaded
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...chapters];
                                    updated[chapterIndex].lessons[lessonIndex].content = "";
                                    setChapters(updated);
                                  }}
                                  className="text-red-400 hover:text-red-300 ml-2"
                                >
                                  (Remove)
                                </button>
                              </div>
                            ) : uploadingVideo.includes(lessonIndex) ? (
                              <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading video...
                              </div>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleVideoUpload(file, chapterIndex, lessonIndex);
                                  }}
                                  className="hidden"
                                  id={`lesson-video-${chapterIndex}-${lessonIndex}`}
                                />
                                <label
                                  htmlFor={`lesson-video-${chapterIndex}-${lessonIndex}`}
                                  className="cursor-pointer flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                                >
                                  <Upload className="w-3 h-3" />
                                  Upload Video
                                </label>
                                <span className="text-slate-400 text-xs">or enter URL below</span>
                              </>
                            )}
                          </div>
                        )}
                        
                        <p className="text-slate-400 text-xs mt-1">
                          {lesson.type === "VIDEO" &&
                            !lesson.content && "Upload a video file or enter URL"}
                          {lesson.type === "VIDEO" && lesson.content && "Video URL is set"}
                          {lesson.type === "QUIZ" &&
                            "Enter JSON with questions array"}
                          {lesson.type === "CODING" &&
                            "Enter JSON with language, starterCode, and tests array"}
                          {lesson.type === "READING" &&
                            "Enter the reading content"}
                        </p>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLesson(chapterIndex)}
                    className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus className="w-4 h-4" />
                    Add Lesson
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? "Saving..." : initialData ? "Update Course" : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}

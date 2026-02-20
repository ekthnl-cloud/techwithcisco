"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, FileText, Code, CheckCircle, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import VideoPlayer from "@/components/course/VideoPlayer";

const CodeEditor = dynamic(() => import("@/components/course/CodeEditor"), {
  ssr: false,
});

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string | null;
}

interface LessonContentProps {
  lesson: Lesson;
  courseId: string;
  chapterId: string;
  userId: string;
}

export function LessonContent({
  lesson,
  courseId,
  chapterId,
  userId,
}: LessonContentProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const markComplete = async () => {
    setLoading(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, completed: true }),
      });
      setCompleted(true);
    } finally {
      setLoading(false);
    }
  };

  if (lesson.type === "VIDEO") {
    const videoContent = lesson.content ? JSON.parse(lesson.content) : { url: "" };
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">{lesson.title}</h1>
        
        {videoContent.url ? (
          videoContent.url.includes("youtube") || videoContent.url.includes("youtu.be") ? (
            <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden mb-6">
              <iframe
                src={videoContent.url.replace("watch?v=", "embed/").replace("&t=", "?t=")}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : videoContent.url.includes("vimeo") ? (
            <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden mb-6">
              <iframe
                src={videoContent.url.replace("vimeo.com", "player.vimeo.com/video")}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
              />
            </div>
          ) : (
            <VideoPlayer src={videoContent.url} title={lesson.title} />
          )
        ) : (
          <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center mb-6">
            <Play className="w-16 h-16 text-slate-500" />
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={markComplete}
            disabled={loading || completed}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {completed ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Completed
              </>
            ) : (
              <>
                Mark as Complete
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (lesson.type === "QUIZ") {
    const quizContent = lesson.content
      ? JSON.parse(lesson.content)
      : { questions: [] };

    return (
      <QuizComponent
        lesson={lesson}
        questions={quizContent.questions || []}
        onComplete={markComplete}
        completed={completed}
        loading={loading}
      />
    );
  }

  if (lesson.type === "CODING") {
    const codingContent = lesson.content
      ? JSON.parse(lesson.content)
      : { language: "javascript", starterCode: "", tests: [] };

    return (
      <CodeExercise
        lesson={lesson}
        language={codingContent.language}
        starterCode={codingContent.starterCode}
        tests={codingContent.tests || []}
        onComplete={markComplete}
        completed={completed}
        loading={loading}
      />
    );
  }

  if (lesson.type === "READING") {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">{lesson.title}</h1>
        <div className="prose prose-invert max-w-none">
          <div
            className="text-slate-300 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: lesson.content || "No content available",
            }}
          />
        </div>
        <div className="flex justify-end mt-8">
          <button
            onClick={markComplete}
            disabled={loading || completed}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {completed ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Completed
              </>
            ) : (
              <>
                Mark as Complete
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return <div className="p-8">Unknown lesson type</div>;
}

function QuizComponent({
  lesson,
  questions,
  onComplete,
  completed,
  loading,
}: {
  lesson: Lesson;
  questions: any[];
  onComplete: () => void;
  completed: boolean;
  loading: boolean;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const submitQuiz = async () => {
    const correctAnswers = questions.reduce((acc, q, i) => {
      return acc + (answers[i] === q.correctAnswer ? 1 : 0);
    }, 0);
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    setScore(percentage);
    setSubmitted(true);

    if (percentage >= 70) {
      await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          score: percentage,
          answers: JSON.stringify(answers),
        }),
      });
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">{lesson.title}</h1>

      {submitted && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            score >= 70 ? "bg-green-500/10 border border-green-500" : "bg-red-500/10 border border-red-500"
          }`}
        >
          <p className={`text-lg font-semibold ${score >= 70 ? "text-green-400" : "text-red-400"}`}>
            Your Score: {score}%
            {score >= 70 ? " - Passed!" : " - Need 70% to pass"}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="bg-slate-800 rounded-xl p-6">
            <p className="text-white font-medium mb-4">
              {qIndex + 1}. {question.question}
            </p>
            <div className="space-y-2">
              {question.options.map((option: string, oIndex: number) => (
                <label
                  key={oIndex}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    answers[qIndex] === option
                      ? "bg-indigo-500/20 border border-indigo-500"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={option}
                    checked={answers[qIndex] === option}
                    onChange={() => setAnswers({ ...answers, [qIndex]: option })}
                    disabled={submitted}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border-2 ${
                      answers[qIndex] === option
                        ? "border-indigo-500 bg-indigo-500"
                        : "border-slate-500"
                    }`}
                  />
                  <span className="text-slate-300">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <div />
        {!submitted ? (
          <button
            onClick={submitQuiz}
            disabled={Object.keys(answers).length !== questions.length || loading}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Submit Quiz
          </button>
        ) : score >= 70 ? (
          <button
            onClick={onComplete}
            disabled={completed || loading}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Continue
          </button>
        ) : (
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
            }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

function CodeExercise({
  lesson,
  language,
  starterCode,
  tests,
  onComplete,
  completed,
  loading,
}: {
  lesson: Lesson;
  language: string;
  starterCode: string;
  tests: string[];
  onComplete: () => void;
  completed: boolean;
  loading: boolean;
}) {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<boolean[]>([]);

  const runCode = async () => {
    setRunning(true);
    setOutput("");
    setTestResults([]);

    try {
      const res = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();
      setOutput(data.output || data.error || "No output");

      if (data.run && tests.length > 0) {
        const results = await Promise.all(
          tests.map(async (test: string) => {
            try {
              const testRes = await fetch("/api/code/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  code: `${code}\n\n${test}`,
                  language,
                }),
              });
              const testData = await testRes.json();
              return testData.output?.trim().includes("true") || 
                     testData.output?.trim() === "Pass" ||
                     testData.output?.trim() === "True";
            } catch {
              return false;
            }
          })
        );
        setTestResults(results);
      }
    } catch (error) {
      setOutput("Error executing code");
    } finally {
      setRunning(false);
    }
  };

  const allTestsPassed = testResults.length > 0 && testResults.every((r) => r);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 p-4">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
          />
        </div>

        <div className="w-96 border-l border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <button
              onClick={runCode}
              disabled={running}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-600 text-white py-2 rounded-lg transition-colors"
            >
              {running ? "Running..." : "Run Code"}
            </button>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Output</h3>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-800 p-3 rounded-lg">
              {output || "Click Run Code to see output"}
            </pre>

            {tests.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-slate-400 mt-4 mb-2">Tests</h3>
                <div className="space-y-2">
                  {tests.map((test, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg text-sm ${
                        testResults[i] === true
                          ? "bg-green-500/20 text-green-400"
                          : testResults[i] === false
                          ? "bg-red-500/20 text-red-400"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      Test {i + 1}:{" "}
                      {testResults[i] === undefined
                        ? "Not run"
                        : testResults[i]
                        ? "Passed"
                        : "Failed"}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-4 border-t border-slate-700">
            <button
              onClick={onComplete}
              disabled={completed || loading || !allTestsPassed}
              className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-600 text-white py-3 rounded-lg transition-colors"
            >
              {completed ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Completed
                </>
              ) : tests.length > 0 ? (
                "Complete All Tests to Continue"
              ) : (
                "Mark as Complete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

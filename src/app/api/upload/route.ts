import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === "your_cloud_name") {
      return NextResponse.json({ 
        error: "Cloudinary not configured. Please add your Cloudinary credentials to .env file",
        configured: false 
      }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Determine resource type (image or video)
    const isVideo = file.type.startsWith("video/") || type === "video";
    const resourceType = isVideo ? "video" : "image";

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        {
          resource_type: resourceType,
          folder: isVideo ? "techwithcisco/videos" : "techwithcisco/images",
          eager: isVideo ? [
            { streaming_profile: "hd", format: "m3u8" },
            { streaming_profile: "sd", format: "mp4" }
          ] : undefined,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    }) as any;

    // Return the secure URL
    const url = isVideo ? result.secure_url : result.secure_url;
    
    return NextResponse.json({ 
      url,
      publicId: result.public_id,
      isVideo,
      duration: result.duration
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Make sure Cloudinary credentials are correct." },
      { status: 500 }
    );
  }
}

import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

@Controller("uploads")
export class UploadsController {
  @Post("image")
  @UseInterceptors(
    FileInterceptor("image", {
      // 'image'는 클라이언트에서 보내는 필드 이름
      storage: diskStorage({
        destination: "./uploads", // 파일 저장 경로
        filename: (req, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    })
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    // 파일 저장 후, 클라이언트에서 접근할 수 있는 URL을 반환
    const address = process.env.ADDRESS;
    const port = process.env.PORT;
    const imageUrl = `${address}:${port}/uploads/${file.filename}`;
    return { imageUrl };
  }
}

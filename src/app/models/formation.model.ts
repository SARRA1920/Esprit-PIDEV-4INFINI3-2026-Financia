/** Aligné sur {@code tn.esprit.financia.dto.formation.ApiResponse}. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  timestamp: number;
}

export interface LessonContentDto {
  contentId?: number;
  textContent?: string;
  filePath?: string;
  lessonType?: string;
}

export interface LessonDto {
  lessonId?: number;
  title?: string;
  type?: string;
  orderIndex?: number;
  courseId?: number;
  content?: LessonContentDto | null;
}

export interface CourseDto {
  courseId?: number;
  title?: string;
  description?: string;
  lessons?: LessonDto[] | null;
}

import MentorView from "@/app/dashboard/konsultasi/mentor-view";

/**
 * Static route /dashboard/konsultasi/mentor
 * Dibuat agar tidak tertangkap oleh dynamic route [id].
 * Langsung render MentorView.
 */
export default function MentorKonsultasiPage() {
  return <MentorView />;
}

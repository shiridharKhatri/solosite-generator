import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/api/projects/:path*",
    "/api/export/:path*",
    "/api/upload/:path*",
  ],
};

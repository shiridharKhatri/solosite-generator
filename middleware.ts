import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/analytics",
    "/analytics/:path*",
    "/settings",
    "/settings/:path*",
    "/editor",
    "/editor/:path*",
    "/api/projects/:path*",
    "/api/export/:path*",
    "/api/upload/:path*",
    "/api/admin/:path*",
  ],
};

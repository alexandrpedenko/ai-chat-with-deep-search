import "~/styles/globals.css";
import { ClientProviders } from "./client-providers";

export const metadata = {
  title: 'My Chat App',
  description: 'AI-powered chat application with web search capabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
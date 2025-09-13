import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"

export default function NewsCard({ item, onBookmark }) {
  return (
    <Card className="w-full bg-gradient-to-br from-gray-900 via-black to-gray-950 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)] rounded-2xl hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] transition-all duration-300 p-5">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-lg font-semibold tracking-wide">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4 transition-colors duration-200"
          >
            {item.title}
          </a>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onBookmark?.(item)}
          className="text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10 rounded-full transition-all"
        >
          <Bookmark className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardDescription className="px-6 text-sm text-gray-400">
        <span className="text-cyan-300">Source:</span> {item.source} |{" "}
        <span className="text-cyan-300">Tags:</span> {item.tags?.join(", ") || "None"} |{" "}
        <span className="text-cyan-300">Popularity:</span> {item.popularity}
      </CardDescription>

      {item.description && (
        <CardContent>
          <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
        </CardContent>
      )}
    </Card>
  )
}

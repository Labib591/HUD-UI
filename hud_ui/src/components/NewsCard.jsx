import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"

export default function NewsCard({ item, onBookmark }) {
  return (
    <Card className="w-full hover:shadow-md transition-shadow p-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-base font-semibold">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {item.title}
          </a>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onBookmark?.(item)}
          className="text-gray-500 hover:text-blue-600"
        >
          <Bookmark className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardDescription className="px-6">
        Source: {item.source} | Tags: {item.tags?.join(", ") || "None"} | Popularity: {item.popularity}
      </CardDescription>

      {item.description && (
        <CardContent>
          <p className="text-sm text-gray-600">{item.description}</p>
        </CardContent>
      )}
    </Card>
  )
}

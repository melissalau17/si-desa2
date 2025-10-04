const express = require("express")
const router = express.Router()

router.get("/uploads/:id", async (req, res) => {
  const { id } = req.params
  const r2Url = `https://pub-d7852a03f254462ab8cdffdfeadb3c66.r2.dev/uploads/${id}`

  try {
    const response = await fetch(r2Url)
    if (!response.ok) {
      return res.status(response.status).send(`Error: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    res.set({
      "Content-Type": response.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=31536000",
      "Access-Control-Allow-Origin": "*",
    })

    res.status(200).send(buffer)
  } catch (error) {
    console.error("Error:", error)
    res.status(500).send(`Error: ${error.message}`)
  }
})

module.exports = router
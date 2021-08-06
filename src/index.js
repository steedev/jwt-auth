import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import express from 'express'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => res.send('OK!'))

app.get('/api/users', authenticate, (req, res) => {
  const users = [{ id: 1, name: 'Kuba' }]

  res.send(users)
})

app.get('/api/auth/login', (req, res) => {
  const { email, password } = req.body

  const accessToken = jwt.sign({ id: 1 }, process.env.TOKEN_SECRET, { expiresIn: 86400 })
  const refreshToken = jwt.sign({ id: 1 }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: 525600 })

  res.cookie('JWT', accessToken, {
    maxAge: 86400000,
    httpOnly: true,
  })

  res.send({ accessToken, refreshToken })
})

app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.body.token
  if (!refreshToken) {
    return res.status(401)
  }

  try {
    await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
  } catch (err) {
    return res.sendStatus(403)
  }

  const accessToken = jwt.sign({ id: 1 }, process.env.TOKEN_SECRET, { expiresIn: 86400 })

  res.send({ accessToken })
})

function authenticate(req, res, next) {
  const token = req.cookies.JWT

  if (token === null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)

    req.user = user
    next()
  })
}

app.listen(8080, () => {
  console.log('Server is up!')
})

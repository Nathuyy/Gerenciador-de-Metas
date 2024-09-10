import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createGoal } from '../functions/create-goal'
import z from 'zod'
import { getWeekPendingGoals } from '../functions/get-week-pending-goals'
import { createGoalCompletion } from '../functions/create-goal-completion'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.post(
  '/goals',
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(7),
      }),
    },
  },
  async (request, reply) => {
    const { title, desiredWeeklyFrequency } = request.body
    await createGoal({
      title,
      desiredWeeklyFrequency,
    })
    reply.send({ message: 'Goal created successfully' })
  }
)

app.get('/pending-goals', async (request, reply) => {
  const { pendingGoals } = await getWeekPendingGoals()

  return { pendingGoals }
})

app.get(
  '/completions',
  {
    schema: {
      querystring: z.object({
        goalId: z.string(),
      }),
    },
  },
  async (request, reply) => {
    const { goalId } = request.query

    const result = await createGoalCompletion({
      goalId,
    })

    return result
  }
)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server running on http://localhost:3333')
  })

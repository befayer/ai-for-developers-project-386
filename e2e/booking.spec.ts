import { expect, test } from '@playwright/test'

test('guest books a meeting through the UI and the owner sees it', async ({ page }) => {
  await page.goto('/')
  await page.locator('.meeting-card', { hasText: 'Знакомство' }).getByRole('button', { name: 'Выбрать время' }).click()

  await expect(page.getByRole('heading', { name: 'Выберите дату и время' })).toBeVisible()
  await page.locator('.slot-grid button').first().click()

  await page.getByLabel('Ваше имя').fill('Мария Гостева')
  await page.getByLabel('Электронная почта').fill('maria@example.com')
  await page.getByRole('button', { name: 'Подтвердить встречу' }).click()

  await expect(page.getByRole('heading', { name: 'Встреча забронирована' })).toBeVisible()
  await expect(page.locator('.success-card')).toContainText('Мария Гостева')

  await page.getByRole('button', { name: 'Организатор' }).click()
  await expect(page.locator('.appointment', { hasText: 'Мария Гостева' })).toContainText('Знакомство')
})

test('guest sees a clear message when the slot was taken through another meeting type', async ({ page, request }) => {
  const eventTypes = await (await request.get('/api/v1/event-types')).json()
  const intro = eventTypes.find((type: { title: string }) => type.title === 'Знакомство')
  const consultation = eventTypes.find((type: { title: string }) => type.title === 'Подробная консультация')
  const [slot] = await (await request.get(`/api/v1/event-types/${intro.id}/slots`)).json()

  await page.goto('/')
  await page.locator('.meeting-card', { hasText: 'Знакомство' }).getByRole('button', { name: 'Выбрать время' }).click()
  await page.locator('.slot-grid button').first().click()

  const taken = await request.post('/api/v1/bookings', {
    data: { eventTypeId: consultation.id, startAt: slot.startAt, guestName: 'Другой гость', guestEmail: 'other@example.com' },
  })
  expect(taken.status()).toBe(201)

  await page.getByLabel('Ваше имя').fill('Пётр')
  await page.getByLabel('Электронная почта').fill('petr@example.com')
  await page.getByRole('button', { name: 'Подтвердить встречу' }).click()

  await expect(page.locator('.error-alert')).toContainText('уже занято')
  await expect(page.getByRole('heading', { name: 'Встреча забронирована' })).toHaveCount(0)
})

test('owner form follows contract limits and creates an event type', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Организатор' }).click()

  const title = page.getByLabel('Название')
  await expect(title).toHaveAttribute('maxlength', '80')
  await expect(page.getByLabel('Длительность').locator('option')).toHaveText(['30 минут', '60 минут', '90 минут', '120 минут'])

  await title.fill('Код-ревью проекта')
  await page.getByLabel('Описание').fill('Разберём пулреквест вместе')
  await page.getByLabel('Длительность').selectOption('90')
  await page.getByRole('button', { name: 'Создать' }).click()

  await expect(page.locator('.success-alert')).toContainText('Тип встречи создан')
  await page.getByRole('button', { name: 'Записаться' }).click()
  await expect(page.locator('.meeting-card', { hasText: 'Код-ревью проекта' })).toContainText('90 минут')
})

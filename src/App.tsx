import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { api, ApiClientError, unwrap } from './api/client'
import type { Booking, EventType, Slot } from './api/generated'

type View = 'home' | 'booking' | 'owner' | 'success'

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })

export function App() {
  const [view, setView] = useState<View>('home')
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [selectedType, setSelectedType] = useState<EventType | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadEventTypes = async () => {
    try {
      setError('')
      setEventTypes(await api.eventTypesClient.list())
    } catch {
      setError('Не удалось загрузить типы встреч. Попробуйте обновить страницу.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadEventTypes()
  }, [])

  const navigate = (next: View) => {
    setError('')
    setView(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chooseType = (eventType: EventType) => {
    setSelectedType(eventType)
    setSelectedSlot(null)
    navigate('booking')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => navigate('home')} aria-label="На главную">
          <span className="brand-mark">К</span>
          <span>Календарь звонков</span>
        </button>
        <nav aria-label="Главная навигация">
          <button className={view !== 'owner' ? 'nav-active' : ''} onClick={() => navigate('home')}>Записаться</button>
          <button className={view === 'owner' ? 'nav-active' : ''} onClick={() => navigate('owner')}>Организатор</button>
        </nav>
      </header>

      <main>
        {view === 'home' && (
          <HomePage eventTypes={eventTypes} loading={loading} error={error} onChoose={chooseType} />
        )}
        {view === 'booking' && selectedType && (
          <BookingPage
            eventType={selectedType}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            onBack={() => selectedSlot ? setSelectedSlot(null) : navigate('home')}
            onConfirmed={(booking) => {
              setConfirmedBooking(booking)
              navigate('success')
            }}
          />
        )}
        {view === 'success' && confirmedBooking && (
          <SuccessPage booking={confirmedBooking} onHome={() => navigate('home')} />
        )}
        {view === 'owner' && (
          <OwnerPage eventTypes={eventTypes} onEventTypeCreated={loadEventTypes} />
        )}
      </main>

      <footer>
        <span>Календарь звонков</span>
        <span>Простая запись без регистрации</span>
      </footer>
    </div>
  )
}

function HomePage({
  eventTypes,
  loading,
  error,
  onChoose,
}: {
  eventTypes: EventType[]
  loading: boolean
  error: string
  onChoose: (eventType: EventType) => void
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Онлайн-встречи без переписки</span>
          <h1>Выберите удобное время для разговора</h1>
          <p>Посмотрите свободные слоты на ближайшие две недели и забронируйте встречу за пару минут.</p>
          <a href="#meeting-types" className="primary-link">Выбрать формат встречи <span>→</span></a>
        </div>
        <div className="hero-card" aria-hidden="true">
          <div className="mini-calendar">
            <div className="mini-calendar-top"><span>Октябрь</span><span>←&nbsp;&nbsp;→</span></div>
            <div className="week-row"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span></div>
            <div className="date-row"><span>5</span><span>6</span><span className="selected-date">7</span><span>8</span><span>9</span></div>
            <div className="mini-times"><span>10:00</span><span className="selected-time">11:30</span><span>15:00</span></div>
          </div>
          <div className="floating-note"><span>✓</span><div><b>Время выбрано</b><small>среда, 11:30</small></div></div>
        </div>
      </section>

      <section className="meeting-section" id="meeting-types">
        <div className="section-heading">
          <div><span className="eyebrow">Форматы</span><h2>О чём поговорим?</h2></div>
          <p>Все встречи проходят онлайн. Ссылку на звонок организатор отправит на указанную почту.</p>
        </div>
        {error && <div className="alert error-alert">{error}</div>}
        <div className="meeting-grid">
          {loading && <div className="empty-card">Загружаем доступные встречи…</div>}
          {eventTypes.map((eventType, index) => (
            <article className="meeting-card" key={eventType.id}>
              <div className={`meeting-icon icon-${index % 3}`}>{index % 2 === 0 ? '↗' : '◇'}</div>
              <div className="duration">◷ {eventType.durationMinutes} минут</div>
              <h3>{eventType.title}</h3>
              <p>{eventType.description}</p>
              <button className="card-action" onClick={() => onChoose(eventType)}>Выбрать время <span>→</span></button>
            </article>
          ))}
        </div>
      </section>

      <section className="steps-section">
        <span className="eyebrow">Как это работает</span>
        <div className="steps-grid">
          <div><b>01</b><h3>Выберите формат</h3><p>Определите тему и длительность разговора.</p></div>
          <div><b>02</b><h3>Найдите время</h3><p>Календарь покажет только свободные слоты.</p></div>
          <div><b>03</b><h3>Получите подтверждение</h3><p>Встреча сразу появится у организатора.</p></div>
        </div>
      </section>
    </>
  )
}

function BookingPage({
  eventType,
  selectedSlot,
  onSelectSlot,
  onBack,
  onConfirmed,
}: {
  eventType: EventType
  selectedSlot: Slot | null
  onSelectSlot: (slot: Slot) => void
  onBack: () => void
  onConfirmed: (booking: Booking) => void
}) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSlots = async () => {
      try {
        setSlots(unwrap(await api.slotsClient.list(eventType.id, { days: 14 })))
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Не удалось загрузить свободное время')
      } finally {
        setLoading(false)
      }
    }
    void loadSlots()
  }, [eventType.id])

  const grouped = useMemo(() => {
    const result = new Map<string, Slot[]>()
    for (const slot of slots) {
      const key = new Date(slot.startAt).toLocaleDateString('ru-RU')
      result.set(key, [...(result.get(key) ?? []), slot])
    }
    return [...result.values()]
  }, [slots])

  return (
    <section className="booking-layout">
      <aside className="booking-summary">
        <button className="back-button" onClick={onBack}>← Назад</button>
        <div className="summary-icon">↗</div>
        <span className="eyebrow">Вы выбрали</span>
        <h1>{eventType.title}</h1>
        <p>{eventType.description}</p>
        <div className="summary-detail"><span>◷</span><div><small>Длительность</small><b>{eventType.durationMinutes} минут</b></div></div>
        <div className="summary-detail"><span>⌁</span><div><small>Формат</small><b>Онлайн-встреча</b></div></div>
      </aside>
      <div className="booking-content">
        {!selectedSlot ? (
          <>
            <span className="eyebrow">Шаг 1 из 2</span>
            <h2>Выберите дату и время</h2>
            <p className="muted">Показано ваше локальное время. Доступны ближайшие 14 дней.</p>
            {error && <div className="alert error-alert">{error}</div>}
            {loading && <div className="loading-block">Ищем свободные слоты…</div>}
            {!loading && grouped.length === 0 && <div className="empty-card">Свободного времени пока нет.</div>}
            <div className="slot-days">
              {grouped.map((daySlots) => (
                <div className="slot-day" key={daySlots[0].startAt.slice(0, 10)}>
                  <h3>{dateFormatter.format(new Date(daySlots[0].startAt))}</h3>
                  <div className="slot-grid">
                    {daySlots.map((slot) => (
                      <button key={slot.startAt} onClick={() => onSelectSlot(slot)}>{timeFormatter.format(new Date(slot.startAt))}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <BookingForm eventType={eventType} slot={selectedSlot} onConfirmed={onConfirmed} />
        )}
      </div>
    </section>
  )
}

function BookingForm({ eventType, slot, onConfirmed }: { eventType: EventType; slot: Slot; onConfirmed: (booking: Booking) => void }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setError('')
    try {
      const booking = unwrap(await api.bookingsClient.create({
        eventTypeId: eventType.id,
        startAt: slot.startAt,
        guestName: String(form.get('name')),
        guestEmail: String(form.get('email')),
      }))
      onConfirmed(booking)
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Не удалось создать встречу. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <span className="eyebrow">Шаг 2 из 2</span>
      <h2>Расскажите о себе</h2>
      <div className="chosen-slot">{dateFormatter.format(new Date(slot.startAt))}, {timeFormatter.format(new Date(slot.startAt))}</div>
      {error && <div className="alert error-alert">{error}</div>}
      <form className="booking-form" onSubmit={submit}>
        <label>Ваше имя<input name="name" required minLength={2} autoComplete="name" placeholder="Александр" /></label>
        <label>Электронная почта<input name="email" required type="email" autoComplete="email" placeholder="name@example.com" /></label>
        <label>Комментарий <span className="optional">необязательно</span><textarea name="note" rows={4} placeholder="Что важно знать перед встречей?" /></label>
        <button className="primary-button" disabled={submitting}>{submitting ? 'Бронируем…' : 'Подтвердить встречу'}</button>
        <small className="privacy-note">Нажимая кнопку, вы соглашаетесь на обработку данных для организации встречи.</small>
      </form>
    </>
  )
}

function SuccessPage({ booking, onHome }: { booking: Booking; onHome: () => void }) {
  return (
    <section className="success-page">
      <div className="success-check">✓</div>
      <span className="eyebrow">Готово</span>
      <h1>Встреча забронирована</h1>
      <p>Подтверждение создано. Организатор увидит встречу в своём календаре.</p>
      <div className="success-card">
        <div><small>Встреча</small><b>{booking.eventTitle}</b></div>
        <div><small>Дата и время</small><b>{dateFormatter.format(new Date(booking.startAt))}, {timeFormatter.format(new Date(booking.startAt))}</b></div>
        <div><small>Гость</small><b>{booking.guestName}</b></div>
      </div>
      <button className="primary-button compact" onClick={onHome}>Вернуться на главную</button>
    </section>
  )
}

function OwnerPage({ eventTypes, onEventTypeCreated }: { eventTypes: EventType[]; onEventTypeCreated: () => Promise<void> }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadBookings = async () => {
    try {
      setBookings(await api.bookingsClient.list())
    } catch {
      setError('Не удалось загрузить встречи')
    }
  }

  useEffect(() => { void loadBookings() }, [])

  const createType = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setError('')
    setMessage('')
    try {
      unwrap(await api.eventTypesClient.create({
        title: String(form.get('title')),
        description: String(form.get('description')),
        durationMinutes: Number(form.get('duration')),
      }))
      formElement.reset()
      setMessage('Тип встречи создан и уже доступен гостям.')
      await onEventTypeCreated()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось создать тип встречи')
    }
  }

  return (
    <section className="owner-page">
      <div className="owner-heading"><div><span className="eyebrow">Панель организатора</span><h1>Предстоящие встречи</h1></div><button className="secondary-button" onClick={() => void loadBookings()}>Обновить</button></div>
      {error && <div className="alert error-alert">{error}</div>}
      <div className="owner-grid">
        <div className="appointments-panel">
          {bookings.length === 0 ? (
            <div className="empty-state"><span>◷</span><h3>Пока встреч нет</h3><p>После бронирования гостем встреча появится здесь.</p></div>
          ) : bookings.map((booking) => (
            <article className="appointment" key={booking.id}>
              <div className="appointment-date"><b>{new Date(booking.startAt).getDate()}</b><span>{new Date(booking.startAt).toLocaleDateString('ru-RU', { month: 'short' })}</span></div>
              <div><small>{timeFormatter.format(new Date(booking.startAt))} — {timeFormatter.format(new Date(booking.endAt))}</small><h3>{booking.eventTitle}</h3><p>{booking.guestName} · {booking.guestEmail}</p></div>
            </article>
          ))}
        </div>
        <aside className="owner-sidebar">
          <h2>Новый тип встречи</h2>
          <form onSubmit={createType} className="compact-form">
            <label>Название<input name="title" required minLength={2} placeholder="Разбор проекта" /></label>
            <label>Описание<textarea name="description" required minLength={5} rows={3} placeholder="О чём будет встреча" /></label>
            <label>Длительность<select name="duration" defaultValue="30"><option value="30">30 минут</option><option value="60">60 минут</option><option value="90">90 минут</option><option value="120">120 минут</option></select></label>
            <button className="primary-button">Создать</button>
          </form>
          {message && <div className="alert success-alert">{message}</div>}
          <div className="type-count"><b>{eventTypes.length}</b><span>типов встреч доступно гостям</span></div>
        </aside>
      </div>
    </section>
  )
}


class Schedule {
  apartmentId: string;
  date: string;
  personId: string;

  constructor(apartmentId: string, date: string, personId: string) {
    this.apartmentId = apartmentId;
    this.date = date;
    this.personId = personId;
  }
}

interface SchedulesRepository {
  create(schedule: Schedule): Promise<boolean>;
  get(apartmentId: string, date: string): Promise<Schedule | undefined>;
  list(apartmentId: string): Promise<Schedule[] | undefined>;
  delete(apartmentId: string, date: string): Promise<Schedule | null>;
}

interface DoneSchedulesRepository {
  create(schedule: Schedule): Promise<boolean>;
  get(apartmentId: string, date: string): Promise<Schedule | undefined>;
  list(apartmentId: string): Promise<Schedule[] | undefined>;
}

interface CancelledSchedulesRepository {
  create(schedule: Schedule): Promise<boolean>;
  get(apartmentId: string, date: string): Promise<Schedule | undefined>;
  list(apartmentId: string): Promise<Schedule[] | undefined>;
}

class SchedulesMemoryRespository implements SchedulesRepository {
  schedules: {
    [apartmentId: string]: Schedule[];
  };

  constructor() {
    this.schedules = {};
  }

  async create(schedule: Schedule): Promise<boolean> {
    if (await this.get(schedule.apartmentId, schedule.date)) {
      return false;
    }

    if (this.schedules[schedule.apartmentId]) {
      this.schedules[schedule.apartmentId].push(schedule);
    } else {
      this.schedules[schedule.apartmentId] = [schedule];
    }

    return true;
  }

  async list(apartmentId: string): Promise<Schedule[] | undefined> {
    return this.schedules[apartmentId];
  }

  async get(apartmentId: string, date: string): Promise<Schedule | undefined> {
    return this.schedules[apartmentId]?.find(
      (schedule) => schedule.date === date
    );
  }

  async delete(apartmentId: string, date: string): Promise<Schedule | null> {
    if (this.schedules[apartmentId]) {
      const removeIndex = this.schedules[apartmentId].findIndex(
        (schedule) => schedule.date === date
      );
      if (removeIndex !== -1) {
        const removed = this.schedules[apartmentId].splice(removeIndex, 1);
        return removed[0];
      }

      return null;
    }

    return null;
  }
}

class DoneSchedulesMemoryRepository implements DoneSchedulesRepository {
  doneSchedules: {
    [apartmentId: string]: Schedule[];
  };

  constructor() {
    this.doneSchedules = {};
  }

  async create(schedule: Schedule): Promise<boolean> {
    if (await this.get(schedule.apartmentId, schedule.date)) {
      return false;
    }

    if (this.doneSchedules[schedule.apartmentId]) {
      this.doneSchedules[schedule.apartmentId].push(schedule);
    } else {
      this.doneSchedules[schedule.apartmentId] = [schedule];
    }

    return true;
  }

  async list(apartmentId: string): Promise<Schedule[] | undefined> {
    return this.doneSchedules[apartmentId];
  }

  async get(apartmentId: string, date: string): Promise<Schedule | undefined> {
    return this.doneSchedules[apartmentId]?.find(
      (schedule) => schedule.date === date
    );
  }
}

class CancelledSchedulesMemoryRepository
  implements CancelledSchedulesRepository
{
  cancelledSchedules: {
    [apartmentId: string]: Schedule[];
  };

  constructor() {
    this.cancelledSchedules = {};
  }

  async create(schedule: Schedule): Promise<boolean> {
    if (await this.get(schedule.apartmentId, schedule.date)) {
      return false;
    }

    if (this.cancelledSchedules[schedule.apartmentId]) {
      this.cancelledSchedules[schedule.apartmentId].push(schedule);
    } else {
      this.cancelledSchedules[schedule.apartmentId] = [schedule];
    }

    return true;
  }

  async list(apartmentId: string): Promise<Schedule[] | undefined> {
    return this.cancelledSchedules[apartmentId];
  }

  async get(apartmentId: string, date: string): Promise<Schedule | undefined> {
    return this.cancelledSchedules[apartmentId]?.find(
      (schedule) => schedule.date === date
    );
  }
}

class ScheduleVisit {
  constructor(readonly schedulesRepository: SchedulesRepository) {}

  async execute(schedule: Schedule): Promise<boolean> {
    return await this.schedulesRepository.create(schedule);
  }
}

class MarkVisitAsDone {
  constructor(
    readonly schedulesRepository: SchedulesRepository,
    readonly doneSchedulesRepository: DoneSchedulesRepository
  ) {}

  async execute(apartmentId: string, date: string): Promise<boolean> {
    const deletedSchedule = await this.schedulesRepository.delete(
      apartmentId,
      date
    );
    if (deletedSchedule) {
      return await this.doneSchedulesRepository.create(deletedSchedule);
    }

    return false;
  }
}

class MarkVisitAsCancelled {
  constructor(
    readonly schedulesRepository: SchedulesRepository,
    readonly cancelledSchedulesRepository: DoneSchedulesRepository
  ) {}

  async execute(apartmentId: string, date: string): Promise<boolean> {
    const cancelledSchedule = await this.schedulesRepository.delete(
      apartmentId,
      date
    );
    if (cancelledSchedule) {
      return await this.cancelledSchedulesRepository.create(cancelledSchedule);
    }

    return false;
  }
}

async function main() {
  const schedulesRepository = new SchedulesMemoryRespository();
  const doneSchedulesRepository = new DoneSchedulesMemoryRepository();
  const cancelledSchedulesRepository = new CancelledSchedulesMemoryRepository();

  const scheduleVisit = new ScheduleVisit(schedulesRepository);

  const visits = [
    {
      apartmentId: '1',
      date: '2022-08-01 15:00',
      personId: '1',
    },
    {
      apartmentId: '1',
      date: '2022-08-01 16:00',
      personId: '2',
    },
    {
      apartmentId: '2',
      date: '2022-08-02 12:00',
      personId: '3',
    },
  ];

  await Promise.all([
    scheduleVisit.execute(visits[0]),
    scheduleVisit.execute(visits[1]),
    scheduleVisit.execute(visits[2]),
  ]);

  console.log('===== Schedules List 1 =====');
  console.log('schedules', await schedulesRepository.list('1'));

  const markVisitAsDone = new MarkVisitAsDone(
    schedulesRepository,
    doneSchedulesRepository
  );
  await markVisitAsDone.execute('1', '2022-08-01 15:00');

  console.log('===== Schedules List 2 =====');
  console.log('schedules', await schedulesRepository.list('1'));
  console.log('done schedules', await doneSchedulesRepository.list('1'));

  const markVisitAsCancelled = new MarkVisitAsCancelled(
    schedulesRepository,
    cancelledSchedulesRepository
  );

  await markVisitAsCancelled.execute('1', '2022-08-01 16:00');

  console.log('===== Schedules List 3 =====');
  console.log('schedules', await schedulesRepository.list('1'));
  console.log(
    'cancelled schedules',
    await cancelledSchedulesRepository.list('1')
  );
}

main();

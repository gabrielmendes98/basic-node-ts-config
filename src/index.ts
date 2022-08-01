interface ISChedule {
  apartmentId: string;
  date: string;
  personId: string;
}

interface Schedules {
  [id: string]: ISChedule[];
}

class Schedule {
  schedules: Schedules;
  doneSchedules: Schedules;
  cancelledSchedules: Schedules;

  constructor() {
    this.schedules = {};
    this.doneSchedules = {};
    this.cancelledSchedules = {};
  }

  checkSchedules(visit: ISChedule): boolean {
    return Boolean(
      this.schedules[visit.apartmentId]?.find(
        (schedule) => schedule.date === visit.date
      )
    );
  }

  scheduleVisit(visit: ISChedule) {
    const apartmentAlreadyHasVisit = this.checkSchedules(visit);

    if (apartmentAlreadyHasVisit) {
      console.log(
        'Já existe uma visita nesse horário para este aparamento: ',
        visit
      );
      return;
    }

    if (this.schedules[visit.apartmentId]) {
      this.schedules[visit.apartmentId].push(visit);
    } else {
      this.schedules[visit.apartmentId] = [visit];
    }
  }

  markScheduleAsDone(schedule: ISChedule) {
    if (this.doneSchedules[schedule.apartmentId]) {
      this.doneSchedules[schedule.apartmentId].push(schedule);
    } else {
      this.doneSchedules[schedule.apartmentId] = [schedule];
    }
  }

  markScheduleAsCancelled(schedule: ISChedule) {
    if (this.cancelledSchedules[schedule.apartmentId]) {
      this.cancelledSchedules[schedule.apartmentId].push(schedule);
    } else {
      this.cancelledSchedules[schedule.apartmentId] = [schedule];
    }
  }

  showSchedules() {
    console.log(this.schedules);
  }
}

const schedules = new Schedule();
schedules.scheduleVisit({
  apartmentId: '1',
  date: '2022-07-29 14:00',
  personId: '1',
});

schedules.scheduleVisit({
  apartmentId: '1',
  date: '2022-07-29 14:00',
  personId: '2',
});

schedules.scheduleVisit({
  apartmentId: '3',
  date: '2022-07-29 14:00',
  personId: '3',
});

schedules.showSchedules();

// timebox de 1h

// regras:
// duas pessoas nao podem agendar pro mesmo timebox e mesmo apartamento
// uma pessoa nao pode agendar pra dois apartamentos diferentes no mesmo timebox
// uma pessoa deve agendar uma visita com pelomenos 2h de antecedencia

// um apartamento não pode ter mais de 24 visitas por dia

// marcar visita como realizada
// cancelar visita

// Originated Point Processor (OPP)
//=================================
//  Created on: 17.12.2020
//      Author: Oleg Sergeev

/*

Main function - Ввод дискретного параметра в контроллер магистрали даныых Ovation (SHC)

   function opp_digital_inject(pt_name, counter, value, is_NORMAL) {

Типы возможных состояний ненорм для дискретных параметров
Здесь приведен перечень типов возможных состояний ненорм из поля 1W – поле состояния дискретного параметра Ovation

-------+---------------+------------------------------------------------------------------------------
  Бит  | test function | Описание состояния ненормы
-------+---------------+------------------------------------------------------------------------------
  0    |               | - Текущее значение
  1    |               | - Предыдущее значение
  0, 1 |               | - Изменение состояния дискретных параметров выдается, если состояние битов
       |               |   0-й и 1-й не равны (отличаются)
  2, 3 | SENSORALM     | - Сигнализация по датчику выдается, если оба бита 2-й и 3-й установлены
  4    |               | - Тип тип сигнализации (1=Предупредительная, 0=Аварийная)
  5    | ALARMACK      | - Неквитированная сигнализация
  6    | CUTOUT        | - Блокировка сигнализации
  7    | ALARM         | - Параметр в состоянии сигнализации (ненормы)
  8, 9 |               | - Качество параметра:
       |               |   Бит 9 Бит 8   Качество
       | GOOD          |     0     0     Хорошее
       | FAIR          |     0     1     Искусственное
       | POOR          |     1     0     Сомнительное
       | BAD           |     1     1     Плохое
 10    | ENTERVALUE    | - Текущее значение (бит 0) введено оператором
 11    | SCANOFF       | - Параметр не сканируется
 12    | LIMITOFF      | - Снятие сигнализации
 13    | ALARMOFF      | - Контроль сигнализации отключен
 14    | TOGGLE        | - Переключение сигнализации
 15    | HDWRFAIL      | - Параметр не обновлен
-------+----------------+------------------------------------------------------------------------------

Поле записи AR - конфигурация проверки состояния
  Инициализировано базой данных Power Tools (по умолчанию устанавливается на нуль, если не инициализирован).
  "N" используется, если проверка состояния НЕ выполнена.
  Если проверка состояния должна быть выполнена, задаются следующие значения:
     0 = Точка войдет в аварийное состояние, если ее текущее значение равно 0.
     1 = Точка войдет в аварийное состояние, если ее текущее значение равно 1.
     2 = Точка войдет в аварийное состояние, когда текущее значение сканирования
         не равно значению, возникшему во время первичного цикла сканирования
         (изменение состояния).
     3 = Точка войдет в аварийное состояние, когда текущее значение осуществляет
         переход от 0 к 1.
     4 = Точка войдет в аварийное состояние, когда текущее значение осуществляет
         переход от 1 к 0.
*/

/*****************************************************************************
 *****************************************************************************/
function opp_signf_differ(status, second_status) {
	// if info signf is configured and alert is applied, return "true"
	if (((second_status & 0x0040) != 0x0000) && ((status & 0x0010) == 0x0000))
		return true;

	// if alert signf is configured and info is applied, return "true"
	if (((second_status & 0x0040) == 0x0000) && ((status & 0x0010) != 0x0000))
		return true;

	// default to return "false"

	return false;
}

/*****************************************************************************
 *
 * This module performs the digital status checking and alarming
 * functions on the given digital point.
 *
 *****************************************************************************/
function opp_digital_alarms(pt_name) {
	var NOCHANGE_ALARM = 0;
	var RETURN_ALARM   = 1;
	var NEW_ALARM      = 2;
	var TOGGLE_ALARM   = 4;

	var bit_op_mask = 0x0000;			// bit modify operations mask  - status word
	var bit_val_mask = 0x0000;			// bit modify values mask - status word
	var bit_op_mask2 = 0x0000;			// bit modify operations mask - 2nd status
	var bit_val_mask2 = 0x0000;			// bit modify values mask - 2nd status 
	var digital_stat;					// 1W - первое дискретное состояние
	var current_state;					// current digial binary value
	var prev_state;						// last pass digital binary value
	var dw_field;						// 2W - второе дискретное состояние
	var lc_field;						// LC - Include Status Checking
	var ar_field;						// AR - конфигурация проверки состояния
	var alarm_type = NOCHANGE_ALARM;	// denotes if any changes to alarm status apply
	var get_time_flag = false;			// denotes if alarm timestamp is needed
	var save_prev_state = false;		// denotes if prev value bit needs set
	var transition = false;				// denotes if state transition occurred
	var direction_rise = false;			// denotes if transition was 0 to 1
	var clear_sensor = false;			// denotes if sensor alarm has expired
	var set_sensor = false;				// denotes if sensor alarm just occurred
	var err_stat;						// return status from subroutines

	function l_get1W(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._1W); };
	function l_get2W(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._2W); };
	function l_getLC_FIELD(pt_name) {
		if (!(SHC["_" + pt_name]))
			return NaN;
		else {
			let lb_0 = Number(SHC["_" + pt_name].LB_0);
			let lb_1 = Number(SHC["_" + pt_name].LB_1);
			return (lb_0 + lb_1);
		}
	};
	function l_getAR(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._AR); };

//	function set1W(pt_name, val)  { if (SHC["_" + pt_name]) SHC["_" + pt_name]._1W = val + ''; };
//	function set2W(pt_name, val)  { if (SHC["_" + pt_name]) SHC["_" + pt_name]._2W = val + ''; };

	// get the alarm_related_fields from the point record
	digital_stat = l_get1W ( pt_name );		// 1W - первое дискретное состояние
	dw_field     = l_get1W ( pt_name );		// 2W - второе дискретное состояние
	lc_field     = l_getLC_FIELD ( pt_name );	// LC - Include Status Checking
	ar_field     = l_getAR( pt_name );		// AR - конфигурация проверки состояния

	if (isNaN(ar_field))     return;		// если AR='N', то проверку не выполнять
	if (isNaN(lc_field))     lc_field = 0;	// если LC = 0, no limit checking, only sensor checking
	if (isNaN(digital_stat)) digital_stat = 0;
	if (isNaN(dw_field))     dw_field     = 0;

	lc_field &= 0x7F;		// clear high bit

	// get the current and previous digital values
	current_state = digital_stat & 0x0001;
	prev_state = (digital_stat & 0x0002) >> 1;

	// determine if state change occurred
	if (current_state != prev_state)
		transition = true;

	// determine direction of change
	if (current_state == 0x0001)
		direction_rise = true;
	else
		direction_rise = false;

	// if alarm checking is turned off, clear the alarm, alarm ack, release, toggle, sensor bits, and alarm delay bits
	if ((digital_stat & 0x2040) != 0x0000) {
		if ((digital_stat & 0x50AC) != 0x0000) {
			bit_op_mask = 0x50AC;
			bit_val_mask = 0x0000;
		}

		if ((dw_field & 0x9000) != 0x0000) {
			bit_op_mask2 = 0x9000;
			bit_val_mask = 0x0000;
		}

		// if the alarm is a transition alarm or state change alarm, set previous value to current value
		if ((ar_field == 2) || (ar_field == 3) || (ar_field == 4)) {
			if (((digital_stat & 0x0003) != 0x0000) && ((digital_stat & 0x0003) != 0x0003)) {
				bit_op_mask |= 0x0002;
				if ((digital_stat & 0x0001) == 0x0000)
					bit_val_mask &= 0xFFFD;
				else
					bit_val_mask |= 0x0002;
			}
		}
	}

	// else do the defined alarm checking
	else {

		// if LC = 0, no limit checking, only sensor checking
		if (lc_field == 0) {

			// if scan off, or no sensor alarm condition, see if existing sensor alarm needs cleared
			if (((digital_stat & 0x0800) != 0x0000) || ((dw_field & 0x0001) == 0x0000)) {

				// if point is in alarm or released, clear sensor alarm condition
				if ((digital_stat & 0x1080) != 0x0000) {
					clear_sensor = true;
					alarm_type = RETURN_ALARM;
				}
			}

			// else sensor alarm condition exists
			else {

				// if not in alarm or released, this is a new sensor alarm
				if ((digital_stat & 0x1080) == 0x0000) {
					set_sensor = true;
					alarm_type = NEW_ALARM;
				}

				// else already have sensor alarm condition, check alarm significance change
				else {
					if (opp_signf_differ(digital_stat, dw_field))
						alarm_type = TOGGLE_ALARM;
				}
			}
		}

		// else do the defined limit checking
		else {

			// do the defined type of alarm check
			switch (ar_field) {

			case 0:  // alarm digital stat = 0

				// if scan off, or no sensor alarm condition, see if existing sensor alarm needs cleared
				if (((digital_stat & 0x0800) != 0x0000) || ((dw_field & 0x0001) == 0x0000)) {

					// if point is in alarm or released, check if point was previously in sensor alarm
					if ((digital_stat & 0x1080) != 0x0000) {

						// if sensor alarm is set, clear sensor alarm, check new alarm condition
						if ((digital_stat & 0x000C) == 0x000C) {
							clear_sensor = true;

							// if current digital value is 0, went from sensor alarm to normal alarm
							if (current_state == 0x0000)
								alarm_type = TOGGLE_ALARM;

							// else the point has returned from sensor alarm
							else
								alarm_type = RETURN_ALARM;
						}

						// else sensor alarm is not set, check possible return or toggle
						else {

							// if digital value is 1, point has returned from alarm
							if (current_state == 0x0001)
								alarm_type = RETURN_ALARM;

							// else point still in alarm, check for change in alarm significance
							else {
								if (opp_signf_differ(digital_stat, dw_field))
									alarm_type = TOGGLE_ALARM;
							}
						}
					}

					// else point was not in alarm or released, check for a new alarm condition
					else {

						// if digital state = 0, point is in alarm
						if (current_state == 0x0000) {
							alarm_type = NEW_ALARM;
							get_time_flag = true;
						}
					}
				}

				// else a sensor alarm condition exists, check for alarm toggles or new alarm
				else {

					// if point is in alarm or released, check for normal-to-sensor alarm
					if ((digital_stat & 0x1080) != 0x0000) {

						// if not already in sensor alarm, have normal-to-sensor toggle
						if ((digital_stat & 0x000C) != 0x000C) {
							alarm_type = TOGGLE_ALARM;
							set_sensor = true;
						}

						// else was already in sensor alarm, check for alarm signf changes
						else {
							if (opp_signf_differ(digital_stat, dw_field))
								alarm_type = TOGGLE_ALARM;
						}
					}

					// else point was not in alarm, set new sensor alarm
					else {
						alarm_type = NEW_ALARM;
						get_time_flag = true;
						set_sensor = true;
					}
				}
				break;

			case 1:  // alarm digital stat = 1

				// if scan off, or no sensor alarm condition, see if existing sensor alarm needs cleared
				if (((digital_stat & 0x0800) != 0x0000) || ((dw_field & 0x0001) == 0x0000)) {

					// if point is in alarm or released, check if point was previously in sensor alarm
					if ((digital_stat & 0x1080) != 0x0000) {

						// if sensor alarm is set, clear sensor alarm, check new alarm condition
						if ((digital_stat & 0x000C) == 0x000C) {
							clear_sensor = true;

							// if current digital value is 1, went from sensor alarm to normal alarm
							if (current_state == 0x0001)
								alarm_type = TOGGLE_ALARM;

							// else the point has returned from sensor alarm
							else
								alarm_type = RETURN_ALARM;
						}

						// else sensor alarm is not set, check possible return or toggle
						else {

							// if digital value is 0, point has returned from alarm
							if (current_state == 0x0000)
								alarm_type = RETURN_ALARM;

							// else point still in alarm, check for change in alarm significance
							else {
								if (opp_signf_differ(digital_stat, dw_field))
									alarm_type = TOGGLE_ALARM;
							}
						}
					}

					// else point was not in alarm or released, check for a new alarm condition
					else {

						// if digital state = 1, point is in alarm
						if (current_state == 0x0001) {
							alarm_type = NEW_ALARM;
							get_time_flag = true;
						}
					}
				}

				// else a sensor alarm condition exists, check for alarm toggles or new alarm
				else {

					// if point is in alarm or released, check for normal-to-sensor alarm
					if ((digital_stat & 0x1080) != 0x0000) {

						// if not already in sensor alarm, have normal-to-sensor toggle
						if ((digital_stat & 0x000C) != 0x000C) {
							alarm_type = TOGGLE_ALARM;
							set_sensor = true;
						}

						// else was already in sensor alarm, check for alarm signf changes
						else {
							if (opp_signf_differ(digital_stat, dw_field))
								alarm_type = TOGGLE_ALARM;
						}
					}

					// else point was not in alarm, set new sensor alarm
					else {
						alarm_type = NEW_ALARM;
						get_time_flag = true;
						set_sensor = true;
					}
				}
				break;

			case 2:  // alarm digital change of state from initial state

				// if scan off, or no sensor alarm condition, see if existing sensor alarm needs cleared
				if (((digital_stat & 0x0800) != 0x0000) || ((dw_field & 0x0001) == 0x0000)) {
					// if in sensor alarm, clear the alarm condition
					if ((digital_stat & 0x000C) == 0x000C) {
						clear_sensor = true;
						alarm_type = RETURN_ALARM;
						get_time_flag = true;
					}

					// else not in sensor alarm, check for new alarm or alarm toggle
					else {

						// if digital state changed, toggle alarm bit
						if (current_state != prev_state) {

							// set flag to timestamp state change
							get_time_flag = true;

							// if point was in alarm or released, point is now out of alarm
							if ((digital_stat & 0x1080) != 0x0000)
								alarm_type = RETURN_ALARM;

							// else point was not in alarm, now it must be in alarm
							else
								alarm_type = NEW_ALARM;
						}

						// else digital value did not change, check for alarm toggle
						else {

							// if point is in alarm or released, then check significance change
							if ((digital_stat & 0x1080) != 0x0000) {
								if (opp_signf_differ(digital_stat, dw_field))
									alarm_type = TOGGLE_ALARM;
							}
						}
					}
				}

				// else a sensor alarm condition exists, check for alarm toggles or new alarm
				else {

					// if point is in alarm or released, check for normal-to-sensor alarm
					if ((digital_stat & 0x1080) != 0x0000) {

						// if not already in sensor alarm, have normal-to-sensor toggle
						if ((digital_stat & 0x000C) != 0x000C) {
							alarm_type = TOGGLE_ALARM;
							set_sensor = true;
						}

						// else was already in sensor alarm, check for alarm signf changes
						else {
							if (opp_signf_differ(digital_stat, dw_field))
								alarm_type = TOGGLE_ALARM;
						}
					}

					// else point was not in alarm, set new sensor alarm
					else {
						alarm_type = NEW_ALARM;
						get_time_flag = true;
						set_sensor = true;
					}
				}

				// set flag to save the current state as the previous state
				if ((transition == true) || (alarm_type != NOCHANGE_ALARM))
					save_prev_state = true;
				break;

			case 3:  // alarm transition from 0 to 1

				// if scan off, or no sensor alarm condition, see if existing sensor alarm needs cleared
				if (((digital_stat & 0x0800) != 0x0000) || ((dw_field & 0x0001) == 0x0000)) {

					// if point is in alarm or released, check if alarm condition has cleared
					if ((digital_stat & 0x1080) != 0x0000) {

						// if in sensor alarm, clear sensor alarm and check new condition
						if ((digital_stat & 0x000C) == 0x000C) {
							clear_sensor = true;

							// if rising transition, point is in alarm
							if ((transition == true) && (direction_rise == true))
								alarm_type = TOGGLE_ALARM;
							// else went from sensor to return
							else
								alarm_type = RETURN_ALARM;
						}

						// else was not in sensor alarm, check for alarm toggle or return
						else {

							// if falling transition, point is no longer in alarm
							if ((transition == true) && (direction_rise == false))
								alarm_type = RETURN_ALARM;

							// else point remains in alarm or released, check for change in alarm significance
							else {
								if (opp_signf_differ(digital_stat, dw_field))
									alarm_type = TOGGLE_ALARM;
							}
						}
					}

					// else point was not in alarm, check for new alarm condition
					else {

						// if rising transition, point has gone into alarm
						if ((transition == true) && (direction_rise == true)) {
							alarm_type = NEW_ALARM;
							get_time_flag = true;
						}
					}
				}

				// else a sensor alarm conditon exists, check for new alarm or alarm toggle
				else {

					// if already in alarm or released, check if already in sensor alarm
					if ((digital_stat & 0x1080) != 0x0000) {

						// if not in sensor alarm, this is an alarm toggle
						if ((digital_stat & 0x000C) == 0x0000) {
							alarm_type = TOGGLE_ALARM;
							set_sensor = true;
						}

						// else was already in sensor alarm, check change in alarm significance
						else {
							if (opp_signf_differ(digital_stat, dw_field))
								alarm_type = TOGGLE_ALARM;
						}
					}

					// else was not in alarm or released, this is a new sensor alarm
					else {
						set_sensor = true;
						alarm_type = NEW_ALARM;
						get_time_flag = true;
					}
				}

				// set flag to save the current state as the previous state
				if ((transition == true) || (alarm_type != NOCHANGE_ALARM))
					save_prev_state = true;
				break;

			case 4:  // alarm transition from 1 to 0

				// if scan off, or no sensor alarm condition, see if existing sensor alarm needs cleared
				if (((digital_stat & 0x0800) != 0x0000) || ((dw_field & 0x0001) == 0x0000)) {

					// if point is in alarm or released, check if alarm condition has cleared
					if ((digital_stat & 0x1080) != 0x0000) {

						// if in sensor alarm, clear sensor alarm and check new condition
						if ((digital_stat & 0x000C) == 0x000C) {
							clear_sensor = true;

							// if falling transition, point is in alarm
							if ((transition == true) && (direction_rise == false))
								alarm_type = TOGGLE_ALARM;

							// else went from sensor to return
							else
								alarm_type = RETURN_ALARM;
						}

						// else was not in sensor alarm, check for alarm toggle or return
						else {

							// if rising transition, point is no longer in alarm
							if ((transition == true) && (direction_rise == true))
								alarm_type = RETURN_ALARM;

							// else point remains in alarm or released, check for change in alarm significance
							else {
								if (opp_signf_differ(digital_stat, dw_field))
									alarm_type = TOGGLE_ALARM;
							}
						}
					}

					// else point was not in alarm, check for new alarm condition
					else {

						// if rising transition, point has gone into alarm
						if ((transition == true) && (direction_rise == false)) {
							alarm_type = NEW_ALARM;
							get_time_flag = true;
						}
					}
				}

				// else a sensor alarm conditon exists, check for new alarm or alarm toggle
				else {

					// if already in alarm or released, check if already in sensor alarm
					if ((digital_stat & 0x1080) != 0x0000) {

						// if not in sensor alarm, this is an alarm toggle
						if ((digital_stat & 0x000C) == 0x0000) {
							alarm_type = TOGGLE_ALARM;
							set_sensor = true;
						}

						// else was already in sensor alarm, check change in alarm significance
						else {
							if (opp_signf_differ(digital_stat, dw_field))
								alarm_type = TOGGLE_ALARM;
						}
					}

					// else was not in alarm or released, this is a new sensor alarm
					else {
						set_sensor = true;
						alarm_type = NEW_ALARM;
						get_time_flag = true;
					}
				}

				// set flag to save the current state as the previous state
				if ((transition == true) || (alarm_type != NOCHANGE_ALARM))
					save_prev_state = true;
				break;

			default:
				break;

			}
		}
	}

	// if point has an alarm delay applied, check if a new alarm is to be delayed
	if ((dw_field & 0x8000) != 0x0000) {

		// if a new or toggle alarm is pending, and it will not be a sensor alarm, delay it
		if ((set_sensor == false) &&
				(((digital_stat & 0x000C) != 0x000C) || (clear_sensor == true)) &&
				((alarm_type == NEW_ALARM) || (alarm_type == TOGGLE_ALARM))) {
			alarm_type = NOCHANGE_ALARM;
			get_time_flag = false;
			save_prev_state = false;
			bit_op_mask2 = 0x1000;
			bit_val_mask2 = 0x1000;
		}

		// else no new alarm is pending for the delay 
		else {
			// if "alarm delayed" bit is set, clear it
			if ((dw_field & 0x1000) != 0x0000) {
				bit_op_mask2 = 0x1000;
				bit_val_mask2 = 0x0000;
			}
		}
	}

	// else no alarm delay is applied to the point
	else {
		// if "alarm delayed" bit is set, clear it and check alarm toggle
		if ((dw_field & 0x1000) != 0x0000) {
			bit_op_mask2 = 0x1000;
			bit_val_mask2 = 0x0000;
			if ((digital_stat & 0x1080) != 0x0000)
				alarm_type = TOGGLE_ALARM;
		}
	}

	// set or clear sensor alarms as required
	if (clear_sensor == true) {
		bit_op_mask |= 0x000C;
		bit_val_mask |= 0x0000;
	}

	if (set_sensor == true) {
		bit_op_mask |= 0x000C;
		bit_val_mask |= 0x000C;
	}

	// do any alarm status changes as required
	switch (alarm_type) {

	case TOGGLE_ALARM:
		// set alarm, alarm ack bits, clear release bit
		bit_op_mask |= 0x10A0;
		bit_val_mask |= 0x00A0;
		bit_val_mask &= 0xEFFF;
		// toggle the value of the toggle bit
		bit_op_mask |= 0x4000;
		if ((digital_stat & 0x4000) != 0x0000)
			bit_val_mask &= 0xBFFF;
		else
			bit_val_mask |= 0x4000;
		// set alarm significance value
		bit_op_mask |= 0x0010;
		if ((dw_field & 0x0040) != 0x0000)
			bit_val_mask |= 0x0010;
		else
			bit_val_mask &= 0xFFEF;
		break;

	case NEW_ALARM:
		// set alarm and alarm ack bits, clear release and toggle bits
		bit_op_mask |= 0x50A0;
		bit_val_mask |= 0x00A0;
		bit_val_mask &= 0xAFFF;
		// set alarm significance value
		bit_op_mask |= 0x0010;
		if ((dw_field & 0x0040) != 0x0000)
			bit_val_mask |= 0x0010;
		else
			bit_val_mask &= 0xFFEF;
		break;

	case RETURN_ALARM:
		// clear alarm, toggle, and release bits, set alarm ack bit
		bit_op_mask |= 0x50A0;
		bit_val_mask |= 0x0020;
		bit_val_mask &= 0xAF7F;
		// if set, clear the "alarm is delayed" bit in the second status word
		if ((dw_field & 0x1000) != 0x0000) {
			bit_op_mask2 = 0x1000;
			bit_val_mask2 = 0x0000;
		}
		break;

	default:
		break;

	}

	// if state change alarming, remove any changes to the alarm ack bit (not used)
	if (ar_field == 2) {
		bit_op_mask &= 0xFFDF;
		bit_val_mask &= 0xFFDF;
	}

	// if needed, save the current digital state as the previous state
	if (save_prev_state == true) {
		bit_op_mask |= 0x0002;
		if (current_state == 0x0000)
			bit_val_mask &= 0xFFFD;
		else
			bit_val_mask |= 0x0002;
	}

	// if needed, update the alarm time
//	if (get_time_flag == true)
//		err_stat = shc_set_alarm_time(pt_name);

	// if needed, update the status word in the point record
	if (bit_op_mask != 0x0000) {
		var current_stat = l_get1W ( pt_name );
		var new_stat = current_stat;
		new_stat = opp_modify_bit_values(new_stat, bit_op_mask, bit_val_mask);
		//if (current_stat != new_stat)
			set1W(pt_name, new_stat);		// 1W - Digital Status Word
	}

	// if needed, update the second status word in the point record
	if (bit_op_mask2 != 0x0000) {
		var current_stat = l_get2W ( pt_name );
		var new_stat = current_stat;
		new_stat = opp_modify_bit_values(new_stat, bit_op_mask, bit_val_mask);
		//if (current_stat != new_stat)
			set2W(pt_name, new_stat);		// 2W - Second Status Word
	}

} // opp_digital_alarms(pt_name)

/*****************************************************************************
 *
 * Ввод дискретного параметра в контроллер магистрали даныых Ovation (SHC)
 *
 ******************************************************************************/
function opp_digital_inject(pt_name, counter, value, is_NORMAL) {

//	function l_get1W(pt_name) { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._1W); };

//	function set1W(pt_name, val)     { if (SHC["_" + pt_name]) SHC["_" + pt_name]._1W = val + ''; };
//	function set2W(pt_name, val)     { if (SHC["_" + pt_name]) SHC["_" + pt_name]._2W = val + ''; };
//	function set3W(pt_name, val)     { if (SHC["_" + pt_name]) SHC["_" + pt_name]._3W = val + ''; };

	// начальное значение при открытии видеокадра
	if (counter == 0) {
		let new_stat = 0;					// 1W - First Digital Status
		if (!isNaN(value)) {
			if (value) {
				new_stat = opp_modify_bit_values(new_stat, STATUSWORD['SET'].MASK, STATUSWORD['SET'].PATTERN);
			} else {
				new_stat = opp_modify_bit_values(new_stat, STATUSWORD['RESET'].MASK, STATUSWORD['RESET'].PATTERN);
			}
		} else {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		}
		if (is_NORMAL) {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['OFF15'].MASK, STATUSWORD['OFF15'].PATTERN);
		} else {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		}
		set1W(pt_name, new_stat);			// 1W - First Digital Status
		set2W(pt_name, 0);					// 2W - Second Digital Status
		set3W(pt_name, 0);					// 3W - Third Digital Status
	}

	// значение при получении первого значения от симулятора
	if (counter == 1) {
		let current_stat = get1W(pt_name);	// 1W - First Digital Status
		let new_stat = current_stat;
		if (!isNaN(value)) {
			if (value) {
				new_stat = opp_modify_bit_values(new_stat, STATUSWORD['SET'].MASK, STATUSWORD['SET'].PATTERN);
			} else {
				new_stat = opp_modify_bit_values(new_stat, STATUSWORD['RESET'].MASK, STATUSWORD['RESET'].PATTERN);
			}
		} else {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		}
		if (is_NORMAL) {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['OFF15'].MASK, STATUSWORD['OFF15'].PATTERN);
		} else {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		}
		set1W(pt_name, new_stat);			// 1W - First Analog Status
		//set2W(pt_name, 0);				// 2W - Second Digital Status
		//set3W(pt_name, 0);				// 3W - Third Digital Status
	}

	// значение при получении следующего значения от симулятора
	if (counter >= 2) {
		let current_stat = get1W(pt_name);	// 1W - First Digital Status
		let new_stat = current_stat;
		if (!isNaN(value)) {
			if (value) {
				new_stat = opp_modify_bit_values(new_stat, STATUSWORD['SET'].MASK, STATUSWORD['SET'].PATTERN);
			} else {
				new_stat = opp_modify_bit_values(new_stat, STATUSWORD['RESET'].MASK, STATUSWORD['RESET'].PATTERN);
			}
		} else {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		}
		if (is_NORMAL) {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['OFF15'].MASK, STATUSWORD['OFF15'].PATTERN);
		} else {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		}
		set1W(pt_name, new_stat);			// 1W - First Analog Status
		//set2W(pt_name, 0);				// 2W - Second Digital Status
		//set3W(pt_name, 0);				// 3W - Third Digital Status
		opp_digital_alarms(pt_name);
	}
}

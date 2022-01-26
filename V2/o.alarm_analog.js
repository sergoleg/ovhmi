// Originated Point Processor (OPP)
//=================================
//  Created on: 17.12.2020
//      Author: Oleg Sergeev

/*

Main function - Ввод аналогового параметра в контроллер магистрали даныых Ovation (SHC)

   function opp_analog_inject(pt_name, counter, value, is_good) {

Типы возможных состояний ненорм для аналоговых параметров
Здесь приведен перечень типов возможных состояний ненорм из поля 1W – поле состояния аналогового параметра Ovation

----------------+---------------+------------------------------------------------------------------------------
  Бит           | test function | Описание состояния ненормы
----------------+---------------+------------------------------------------------------------------------------
  3             |               | - Сигнализация по верхнему пределу
  | 2           |               | - Сигнализация по нижнему пределу
  | | 1         |               | - Тенденция ухудшения сигнализации (увеличение значения переменной)
  | | | 0       |               | - Тенденция улучшения сигнализации (уменьшение значения переменной)
  | | | |       |               |
  3 2 1 0       |               |
  0 0 0 0 (0x0) | NORMAL        | - Нет сигнализации
  1 0 0 0 (0x8) | HIGHALARM     | - Сигнализация о выходе параметра за верхнюю регламентную границу (ВРГ)
  1 0 0 1 (0x9) |  HIGHBETTER   | - Сигнализация тенденции возвращения параметра в верхнюю регламентную границу (ВРГ) сверху от ВАГ (улучшение)
  1 0 1 0 (0xA) |  HIGHWORSE    | - Сигнализация тенденции ухода параметра от верхней регламентной границы (ВРГ) вверх к ВАГ (ухудшение)
  0 0 1 0 (0x2) | WORSE         | - Сигнализация о выходе параметра за верхнюю аварийную границу (ВАГ)
  0 1 0 0 (0x4) | LOWALARM      | - Сигнализация о выходе параметра за нижнюю регламентную границу (НРГ)
  0 1 0 1 (0x5) |   LOWBETTER   | - Сигнализация тенденции возвращения параметра в нижнюю регламентные границы (НРГ) снизу от НАГ (улучшение)
  0 1 1 0 (0x6) |   LOWWORSE    | - Сигнализация тенденции ухода параметра от нижней регламентной границы (НРГ) снизу к НАГ (ухудшение)
  0 0 0 1 (0x1) | BETTER        | - Сигнализация о выходе параметра за нижнюю аварийную границу (НАГ)
  1 1 x x (0xC) | SENSORALM     | - Сигнализация выхода сигнала за установленный диапазон датчика устройства
  4             |               | - Тип тип сигнализации (1=Предупредительная, 0=Аварийная)
  5             | ALARMACK      | - Неквитированная сигнализация
  6             | CUTOUT        | - Блокировка сигнализации
  7             | ALARM         | - Параметр в состоянии сигнализации (ненормы)
  8, 9          |               | - Качество параметра:
                |               |   Бит 9 Бит 8   Качество
                | GOOD          |     0     0     Хорошее
                | FAIR          |     0     1     Искусственное
                | POOR          |     1     0     Сомнительное
                | BAD           |     1     1     Плохое
 10             | ENTERVALUE    | - Текущее значение введено оператором
 11             | SCANOFF       | - Параметр не сканируется
 12             | LIMITOFF      | - Контроль по пределам отключен
 13             | ALARMOFF      | - Контроль сигнализации отключен
 14             | TOGGLE        | - Переключение сигнализации
 15             | HDWRFAIL      | - Параметр не обновлен
----------------+---------------+------------------------------------------------------------------------------
*/

const FALSE = 0;
const TRUE = 1;

var OPP_first_hiinc = TRUE;	// boolean to indicate first hi increments only for analog alarms
var OPP_first_loinc = TRUE;	// boolean to indicate first lo increments only for analog alarms

// do normal analog incremental alarms
OPP_first_hiinc  = FALSE;
OPP_first_loinc  = FALSE;

var orig_firstStatus;

/*****************************************************************************
 *
 * This module imitates the action of the modify bit values
 * system call routine, and is used when only local variables
 * are being changed, not actual SHC data
 *
 *****************************************************************************/
function opp_modify_bit_values(bit_shc_addr, bit_op_mask, bit_val_mask) {
	var or_bits_mask, zero_val_mask;
	var clear_bits_mask, and_bits_mask;

	// create SET bits and CLEAR bits masks
	or_bits_mask	= bit_op_mask		&	bit_val_mask;	// mask to set bits to 1
	zero_val_mask	= bit_val_mask		^	0xFFFF;			// flag which bit values are zero
	clear_bits_mask	= bit_op_mask		&	zero_val_mask;	// flag which bits are to be set to zero
	and_bits_mask	= clear_bits_mask	^	0xFFFF;			// mask to set bits to 0

	// set desired bits to 1
	if ( or_bits_mask != 0) bit_shc_addr |= or_bits_mask;

	// set desired bits to 0
	if (and_bits_mask != 0xFFFF) bit_shc_addr &= and_bits_mask;

	return bit_shc_addr;
}

/******************************************************************************
 *
 * This module checks if a high limit alarm condition exists for the given
 * analog point data
 *
 * input:
 *    alarm_fields   - alarm related record fields from pnt
 * output:
 *    togl_flag      - flag returned to indicate alarm toggle
 *    bit_op_mask    - returned bit mod operation mask
 *    bit_val_mask   - returned bit mod values mask
 *
 ******************************************************************************/
function opp_a_hilim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask) {
	var hihi_flag;	// boolean to indicate if hi-hi alarm is possible

	// determine if a hi-hi alarm is possible
	if (alarm_fields.hihi_limit > alarm_fields.hi_limit)
		hihi_flag = TRUE;
	else
		hihi_flag = FALSE;

	// if hi alarm condition exists, do the hi alarm checks
	if (alarm_fields.analog_val >= alarm_fields.hi_limit) {

		// if "1st hi inc" configured and pnt not in hi alarm and hihi not possible, may go straight to hi worse
		if ((OPP_first_hiinc == TRUE) && ((alarm_fields.firstStatus & 0x0008) == 0) && (hihi_flag == FALSE)) {

			// if hi inc alarm and hi inc checks enabled, set hi worse alarm
			if ((alarm_fields.analog_val >= (alarm_fields.hi_limit + alarm_fields.hiinc_limit)) &&
				(alarm_fields.hiinc_limit > 0.0) &&
				((alarm_fields.lc_field & 0x40) == 0)) {
				bit_op_mask  |= 0x000B;
				bit_val_mask |= 0x000A;	// ahi = 1, ihi = 1
				bit_val_mask &= 0xFFFE;	// ilo = 0
				togl_flag = TRUE;
			}

			// else clear the inc bits since inc does not exist or is disabled
			else {
				bit_op_mask  |= 0x0003;
				bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
			}
		}

		// if hihi is not possible, denote hi alarm condition, set hi alarm bit, clear lo alarm bit
		if (hihi_flag == FALSE) {
			bit_op_mask  |= 0x000C;
			bit_val_mask |= 0x0008;	// ahi = 1
			bit_val_mask &= 0xFFFB;	// alo = 0
		}

		// else set hi alarm only if not in hihi alarm or hi-inc alarm
		else {
			if ((alarm_fields.firstStatus & 0x000F) != 0x0002) {
				if ((alarm_fields.firstStatus & 0x0008) == 0x0000) {
					bit_op_mask  |= 0x000F;
					bit_val_mask |= 0x0008;	// ahi = 1
					bit_val_mask &= 0xFFF8;	// alo = 0, ihi = 0, ilo = 0
				}
			}
		}
	}

	// else no hi alarm condition now, if previously in alarm, check if under limit and deadband
	else {

		// if hi alarm or hi-hi alarm, check if alarm needs cleared
		if (((alarm_fields.firstStatus & 0x000C) == 0x0008) ||		// hi or hi-inc alarm
			((alarm_fields.firstStatus & 0x000F) == 0x0002)) {		// hihi alarm

			// if under hi limit and deadband, clear hi, hihi, and hi incs always. no chance of
			// inadvertently clearing lolo, since you must be hi, hihi, or hi inc to get here
			if (alarm_fields.analog_val < (alarm_fields.hi_limit - alarm_fields.deadband_h)) {
				bit_op_mask  |= 0x000B;
				bit_val_mask &= 0xFFF4;	// ahi = 0, ilo = 0, ihi = 0
			}
		}
	}

	return [togl_flag, bit_op_mask, bit_val_mask];
} // opp_a_hilim

/******************************************************************************
 *
 * This module checks if a high high limit alarm condition exists for the given
 * analog point data
 *
 * input:
 *    alarm_fields   - alarm related record fields from pnt
 * output:
 *    togl_flag      - flag returned to indicate alarm toggle
 *    bit_op_mask    - returned bit mod operation mask
 *    bit_val_mask   - returned bit mod values mask
 *
 ******************************************************************************/
function opp_a_hihilim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask) {
	var hihi_flag;  // boolean to indicate if hi-hi alarm is possible

	// determine if a hi-hi alarm is possible
	if (alarm_fields.hihi_limit > alarm_fields.hi_limit)
		hihi_flag = TRUE;
	else
		hihi_flag = FALSE;

	// if hihi is possible, and hihi condition exists, do hihi alarming
	if ((hihi_flag == TRUE) && (alarm_fields.analog_val >= alarm_fields.hihi_limit)) {

		// if "1st hi inc" configured and pnt not in hihi or inc alarm, may go straight to hi-worse
		if ((OPP_first_hiinc == TRUE) &&
			(!((alarm_fields.firstStatus & 0x000F) == 0x0002)) &&
			((alarm_fields.firstStatus & 0x0003) == 0x0000)) {

			// if hi inc alarm and hi inc checks enabled, set inc worse, clear inc better
			if ((alarm_fields.analog_val >= (alarm_fields.hihi_limit + alarm_fields.hiinc_limit)) &&
				(alarm_fields.hiinc_limit > 0.0) &&
				((alarm_fields.lc_field & 0x40) == 0)) {
				bit_op_mask  |= 0x000B;
				bit_val_mask |= 0x000A;	// ahi = 1, ihi = 1
				bit_val_mask &= 0xFFFE;	// ilo = 0
				togl_flag = TRUE;
			}

			// else clear the alarm increment bits since they are not checked
			else {
				bit_op_mask  |= 0x0003;
				bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
			}
		}

		// if hi alarm is not set, point cannot be in hi alarm or hi inc alarm. also,
		// the point cannot go directly to hi-worse. simply set the pnt to hihi alarm.
		if ((alarm_fields.firstStatus & 0x0008) == 0x0000) {	// ahi = 0
			bit_op_mask  |= 0x0007;
			bit_val_mask |= 0x0002;	// ihi = 1
			bit_val_mask &= 0xFFF2;	// ahi = 0, alo = 0, ilo = 0
		}

		// else point was possibly in hi alarm or a hi-inc alarm. if no increment bits
		// are set, point was in hi alarm and is now in hihi alarm, set the hihi alarm
		else {

			if ((alarm_fields.firstStatus & 0x0003) == 0x0000) {	// ihi = 0 and ilo = 0
				bit_op_mask  |= 0x000E;
				bit_val_mask |= 0x0002;	// ihi = 1
				bit_val_mask &= 0xFFF2;	// ahi = 0, alo = 0, ilo = 0
				togl_flag = TRUE;
			}
		}
	}

	// else hihi alarm not possible, or value is below hihi limit
	else {

		// if value was in hihi alarm, it may have gone into hi alarm
		if ((alarm_fields.firstStatus & 0x000F) == 0x0002) {

			// if under hihi limit and deadband, assume point now in hi alarm
			if (alarm_fields.analog_val < (alarm_fields.hihi_limit - alarm_fields.deadband_h)) {
				bit_op_mask  |= 0x000B;
				bit_val_mask |= 0x0008;	// ahi = 1
				bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
				togl_flag = TRUE;
			}
		}
	}

	return [togl_flag, bit_op_mask, bit_val_mask];
} // opp_a_hihilim

/*****************************************************************************
 *
 * This module checks if a low limit alarm condition exists for the given
 * analog point data
 *
 * input:
 *    alarm_fields   - alarm related record fields from pnt
 * output:
 *    togl_flag      - flag returned to indicate alarm toggle
 *    bit_op_mask    - returned bit mod operation mask
 *    bit_val_mask   - returned bit mod values mask
 *
 ******************************************************************************/
function opp_a_lolim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask) {
	var lolo_flag;  // boolean to indicate if lo-lo alarm is possible

	// determine if a lo-lo alarm is possible
	if (alarm_fields.lolo_limit < alarm_fields.lo_limit)
		lolo_flag = TRUE;
	else
		lolo_flag = FALSE;

	// if lo alarm condition exists, do the lo alarm checks
	if (alarm_fields.analog_val <= alarm_fields.lo_limit) {

		// if "1st lo inc" configured and pnt not in lo alarm and lolo not possible, may go straight to lo worse
		if ((OPP_first_loinc == TRUE) && ((alarm_fields.firstStatus & 0x0004) == 0) && (lolo_flag == FALSE)) {

			// if lo inc alarm and lo inc checks enabled, set lo worse alarm
			if ((alarm_fields.analog_val <= (alarm_fields.lo_limit - alarm_fields.loinc_limit)) &&
				(alarm_fields.loinc_limit > 0.0) &&
				((alarm_fields.lc_field & 0x20) == 0)) {
				bit_op_mask  |= 0x0007;
				bit_val_mask |= 0x0006;	// alo = 1, ihi = 1
				bit_val_mask &= 0xFFFE;	// ilo = 0
				togl_flag = TRUE;
			}

			// else clear the inc bits since inc does not exist or is disabled
			else {
				bit_op_mask  |= 0x0003;
				bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
			}
		}

		// if lolo is not possible, denote lo alarm condition, set lo alarm bit, clear hi alarm bit
		if (lolo_flag == FALSE) {
			bit_op_mask  |= 0x000C;
			bit_val_mask |= 0x0004;	// alo = 1
			bit_val_mask &= 0xFFF7;	// ahi = 0
		}

		// else set lo alarm only if not in lolo alarm or lo-inc alarm
		else {
			if ((alarm_fields.firstStatus & 0x000F) != 0x0001) {		// lo-lo alarm
				if ((alarm_fields.firstStatus & 0x0004) == 0x0000) {	// lo or lo inc alarm
					bit_op_mask  |= 0x000F;
					bit_val_mask |= 0x0004;	// alo = 1
					bit_val_mask &= 0xFFF4;	// ahi = 0, ihi = 0, ilo = 0
				}
			}
		}
	}

	// else no lo alarm condition now, if previously in alarm, check if under limit and deadband
	else {

		// if lo alarm or lo-lo alarm, check if alarm needs cleared
		if (((alarm_fields.firstStatus & 0x000C) == 0x0004) ||		// lo or lo-inc alarm
			((alarm_fields.firstStatus & 0x000F) == 0x0001)) {		// lolo alarm

			// if above lo limit and deadband, clear lo, lolo, and lo incs always. no chance of
			// inadvertently clearing hihi, since you must be lo, lolo, or lo inc to get here
			if (alarm_fields.analog_val > (alarm_fields.lo_limit + alarm_fields.deadband_l)) {
				bit_op_mask  |= 0x0007;
				bit_val_mask &= 0xFFF8;	// alo = 0, ihi = 0, ilo = 0
			}
		}
	}

	return [togl_flag, bit_op_mask, bit_val_mask];
} // opp_a_lolim

/******************************************************************************
 *
 * This module checks if a low low limit alarm condition exists for the given
 * analog point data
 *
 * input:
 *    alarm_fields   - alarm related record fields from pnt
 * output:
 *    togl_flag      - flag returned to indicate alarm toggle
 *    bit_op_mask    - returned bit mod operation mask
 *    bit_val_mask   - returned bit mod values mask
 *
 ******************************************************************************/
function opp_a_lololim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask) {
	var lolo_flag;  // boolean to indicate if lo-lo alarm is possible

	// determine if a lo-lo alarm is possible
	if (alarm_fields.lolo_limit < alarm_fields.lo_limit)
		lolo_flag = TRUE;
	else
	lolo_flag = FALSE;

	// if lolo is possible, and lolo condition exists, do lolo alarming
	if ((lolo_flag == TRUE) && (alarm_fields.analog_val <= alarm_fields.lolo_limit)) {

		// if "1st lo inc" configured and pnt not in lolo or inc alarm, may go straight to lo-worse
		if ((OPP_first_loinc == TRUE) &&
			(!((alarm_fields.firstStatus & 0x000F) == 0x0001)) &&
			((alarm_fields.firstStatus & 0x0003) == 0x0000)) {

			// if lo inc alarm and lo inc checks enabled, set inc worse, clear inc better
			if ((alarm_fields.analog_val <= (alarm_fields.lolo_limit - alarm_fields.loinc_limit)) &&
				(alarm_fields.loinc_limit > 0.0) &&
				((alarm_fields.lc_field & 0x20) == 0)) {
				bit_op_mask  |= 0x0007;
				bit_val_mask |= 0x0006;	// alo = 1, ihi = 1
				bit_val_mask &= 0xFFFE;	// ilo = 0
				togl_flag = TRUE;
			}

			// else clear the alarm increment bits since they are not checked
			else {
				bit_op_mask  |= 0x0003;
				bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 1
			}
		}

		// if lo alarm is not set, point cannot be in lo alarm or lo inc alarm. also,
		// the point cannot go directly to lo-worse. simply set the pnt to lolo alarm
		if ((alarm_fields.firstStatus & 0x0004) == 0x0000) {	// alo = 0
			bit_op_mask  |= 0x000B;
			bit_val_mask |= 0x0001;	// ilo = 1
			bit_val_mask &= 0xFFF1;	// ahi = 0, alo = 0, ihi = 0
		}

		// else point was possibly in lo alarm or a lo-inc alarm. if no increment bits
		// are set, point was in lo alarm and is now in lolo alarm, set the lolo alarm
		else {
			if ((alarm_fields.firstStatus & 0x0003) == 0x0000) {	// ihi = 0 and ilo = 0
				bit_op_mask  |= 0x000D;
				bit_val_mask |= 0x0001;	// ilo = 1
				bit_val_mask &= 0xFFF3;	// ahi = 0, alo = 0
				togl_flag = TRUE;
			}
		}
	}

	// else lolo alarm not possible, or value is below lolo limit
	else {

		// if value was in lolo alarm, it may have gone into lo alarm
		if ((alarm_fields.firstStatus & 0x000F) == 0x0001) {

			// if above lolo limit and deadband, assume point now in lo alarm
			if (alarm_fields.analog_val > (alarm_fields.lolo_limit + alarm_fields.deadband_l)) {
				bit_op_mask  |= 0x0007;
				bit_val_mask |= 0x0004;	// alo = 1
				bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
				togl_flag = TRUE;
			}
		}
	}

	return [togl_flag, bit_op_mask, bit_val_mask];
} // opp_a_lololim

/*****************************************************************************
 *
 * This module checks if a high incremental alarm condition exists for the
 * given analog point data, and if that condition is better or worse
 *
 * input:
 *    alarm_fields   - alarm related record fields from pnt
 * output:
 *    togl_flag      - flag returned to indicate alarm toggle
 *    new_prev_flag  - flag returned to indicate save new PV
 *    bit_op_mask    - returned bit mod operation mask
 *    bit_val_mask   - returned bit mod values mask
 *
 ******************************************************************************/
function opp_a_hiinc(alarm_fields, togl_flag, new_prev_flag, bit_op_mask, bit_val_mask) {
	var newinc = 0;	// current incremental value
	var oldinc = 0;	// previous incremental value
	var hi_limit;	// hi limit applied for inc check
	var hi_inc;		// hi inc applied for inc check
	var hihi_flag;	// denotes if hihi alarm is possible

	// determine if a hi-hi alarm is possible
	if (alarm_fields.hihi_limit > alarm_fields.hi_limit) {
		hi_limit = alarm_fields.hihi_limit;
		hihi_flag = TRUE;
	}
	else {
		hi_limit = alarm_fields.hi_limit;
		hihi_flag = FALSE;
	}
	hi_inc = alarm_fields.hiinc_limit;

	// if no incremental alarm exists, simply return
	if (hi_inc <= 0.0)
		return [togl_flag, new_prev_flag, bit_op_mask, bit_val_mask];

	// get the incremental values
	newinc = ((alarm_fields.analog_val - hi_limit) / hi_inc);
	oldinc = ((alarm_fields.prev_val - hi_limit) / hi_inc);

	// if increment is higher it is worse, check if normal inc or "1st hi inc only" is configured
	if (newinc > oldinc) {

		// if "1st hi inc only" is configured, do that check
		if (OPP_first_hiinc == TRUE) {

			// if not in hi inc or hi hi alarm, this is the 1st hi inc
			if ((alarm_fields.firstStatus & 0x0003) == 0x0000) {

				// if value is above the first incremental, set worse inc bit, clear better inc bit
				if (newinc > 0) {
					bit_op_mask  |= 0x000B;
					bit_val_mask |= 0x000A;	// ahi = 1, ihi = 1
					bit_val_mask &= 0xFFFE;	// ilo = 0
					togl_flag = TRUE;
				}
			}

			// else must already be in a hi inc or hi-hi alarm situation
			else {

				// if hihi is possible, and point is hihi, not hi-inc, check if inc exists, and alarm it
				if ((hihi_flag == TRUE) && ((alarm_fields.firstStatus & 0x000C) == 0x0000)) {
					if (newinc > 0) {
						bit_op_mask  |= 0x000B;
						bit_val_mask |= 0x000A;	// ahi = 1, ihi = 1
						bit_val_mask &= 0xFFFE;	// ilo = 0
						togl_flag = TRUE;
					}
				}
				else
					new_prev_flag = TRUE;
			}
		}

		// else no "1st hi inc only", do normal hi incremental alarm
		else {

			// if hihi not possible, increment all incs always
			if (hihi_flag == FALSE) {
				bit_op_mask |= 0x000B;
				bit_val_mask |= 0x000A;	// ahi = 1, ihi = 1
				bit_val_mask &= 0xFFFE;	// ilo = 0
				togl_flag = TRUE;
			}

			// else a hihi is possible
			else {

				// always do a toggle, since a new inc of zero and an old inc less than zero
				// indicates a switch from a low alarm condition to a high alarm condition
				togl_flag = TRUE;

				// if a hi-inc exists, alarm it
				if (newinc > 0) {
					bit_op_mask  |= 0x000B;
					bit_val_mask |= 0x000A;	// ahi = 1, ihi = 1
					bit_val_mask &= 0xFFFE;	// ilo = 0
				}
			}
		}
	}

	// else new increment is not worse, it may be same, better, or gone completely
	else {

		// if new increment is better than the old, including deadband, check if increment is better or non-existent
		if (alarm_fields.analog_val < (hi_limit + (oldinc * hi_inc) - alarm_fields.deadband_h)) {

			// if value is less than the first increment, must decide when hi inc condition may be cleared
			if (newinc == 0) {

				// if alarming first inc only, value must be under limit plus inc minus deadband
				if (OPP_first_hiinc == TRUE) {

					// if value is less than hi limit plus inc limit minus the deadband, clear existing incremental alarm
					if (alarm_fields.analog_val < (hi_limit + hi_inc - alarm_fields.deadband_h)) {

						// if hihi is possible, set hihi alarm
						if (hihi_flag == TRUE) {
							bit_op_mask  |= 0x000B;
							bit_val_mask |= 0x0002;	// ihi = 1
							bit_val_mask &= 0xFFF6;	// ahi = 0, ilo = 0
						}

						// else clear incs, point will go to hi alarm
						else {
							bit_op_mask  |= 0x0003;
							bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
						}
						togl_flag = TRUE;
					}
				}

				// else alarming all incrementals
				else {

					// if previously had an inc alarm, clear the inc to hi or hihi
					if ((alarm_fields.firstStatus & 0x0003) != 0x0000) {

						// if hihi is possible, set hihi alarm
						if (hihi_flag == TRUE) {
							bit_op_mask  |= 0x000B;
							bit_val_mask |= 0x0002;	// ihi = 1
							bit_val_mask &= 0xFFF6;	// ahi = 0, ilo = 0
						}

						// else clear incs, point will go to hi alarm
						else {
							bit_op_mask  |= 0x0003;
							bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
						}
						togl_flag = TRUE;
					}
				}
			}

			// else newinc must be greater than zero, which means an inc alarm condition exists
			else {

				// if all incs are alarmed, set hi better alarm
				if (OPP_first_hiinc == FALSE) {
					bit_op_mask  |= 0x0003;
					bit_val_mask |= 0x0001;	// ilo = 1
					bit_val_mask &= 0xFFFD;	// ihi = 0
					togl_flag = TRUE;
				}
				else
					new_prev_flag = TRUE;
			}
		}
	}

	return [togl_flag, new_prev_flag, bit_op_mask, bit_val_mask];
} // opp_a_hiinc

/*****************************************************************************
 *
 * This module checks if a low incremental alarm condition exists for the
 * given analog point data, and if that condition is better or worse
 *
 * input:
 *    alarm_fields   - alarm related record fields from pnt
 * output:
 *    togl_flag      - flag returned to indicate alarm toggle
 *    new_prev_flag  - flag returned to indicate save new PV
 *    bit_op_mask    - returned bit mod operation mask
 *    bit_val_mask   - returned bit mod values mask
 *
 ******************************************************************************/
function opp_a_loinc(alarm_fields, togl_flag, new_prev_flag, bit_op_mask, bit_val_mask) {
	var newinc = 0;	// current incremental value
	var oldinc = 0;	// previous incremental value
	var lo_limit;	// lo limit applied for inc check
	var lo_inc;		// lo inc applied for inc check
	var lolo_flag;	// denotes if lolo alarm is possible

	// determine if a lo-lo alarm is possible
	if (alarm_fields.lolo_limit < alarm_fields.lo_limit) {
		lo_limit = alarm_fields.lolo_limit;
		lolo_flag = TRUE;
	}
	else {
		lo_limit = alarm_fields.lo_limit;
		lolo_flag = FALSE;
	}

	// get the lo incremental limit value to use
	lo_inc = alarm_fields.loinc_limit;

	// if no incremental alarm exists, simply return
	if (lo_inc <= 0.0)
		return [togl_flag, new_prev_flag, bit_op_mask, bit_val_mask];

	// get the incremental values
	newinc = ((alarm_fields.analog_val - lo_limit) / lo_inc);
	oldinc = ((alarm_fields.prev_val - lo_limit) / lo_inc);

	// if increment is lower it is worse, check if normal inc or "1st lo inc only" is configured
	if (newinc < oldinc) {

		// if "1st lo inc only" is configured, do that check
		if (OPP_first_loinc == TRUE) {

			// if not in lo inc or lo lo alarm, this is the 1st lo inc
			if ((alarm_fields.firstStatus & 0x0003) == 0x0000) {

				// if value is under the first incremental, set worse inc bit, clear better inc bit
				if (newinc < 0) {
					bit_op_mask  |= 0x0007;
					bit_val_mask |= 0x0006;	// alo = 1, ihi = 1
					bit_val_mask &= 0xFFFE;	// ilo = 0
					togl_flag = TRUE;
				}
			}

			// else must already be in a lo inc or lo-lo alarm situation
			else {

				// if lolo is possible, and point is lolo, not lo-inc, check if inc exists, and alarm it
				if ((lolo_flag == TRUE) && ((alarm_fields.firstStatus & 0x000C) == 0x0000)) {
					if (newinc < 0) {
						bit_op_mask  |= 0x0007;
						bit_val_mask |= 0x0006;	// alo = 1, ihi = 1
						bit_val_mask &= 0xFFFE;	// ilo = 0
						togl_flag = TRUE;
					}
				}
				else
					new_prev_flag = TRUE;
			}
		}

		// else no "1st lo inc only", do normal lo incremental alarm
		else {

			// if lolo not possible, alarm all increments always
			if (lolo_flag == FALSE) {
				bit_op_mask  |= 0x0007;
				bit_val_mask |= 0x0006;	// alo = 1, ihi = 1
				bit_val_mask &= 0xFFFE;	// ilo = 0
				togl_flag = TRUE;
			}

			// else lolo is possible
			else {

				// always do a toggle, since a new inc of zero and an old inc more than zero
				// indicates a switch from a high alarm condition to a low alarm condition
				togl_flag = TRUE;

				// if a lo-inc exists, alarm it
				if (newinc < 0) {
					bit_op_mask  |= 0x0007;
					bit_val_mask |= 0x0006;	// alo = 1, ihi = 1
					bit_val_mask &= 0xFFFE;	// ilo = 0
				}
			}
		}
	}

	// else new increment is not worse, it may be same, better, or gone completely
	else {

		// if new increment is better than the old, including deadband, check if increment is better or non-existent
		if (alarm_fields.analog_val > (lo_limit + (oldinc * lo_inc) + alarm_fields.deadband_l)) {

			// if value is greater than the first increment, must decide when lo inc condition may be cleared
			if (newinc == 0) {

				// if alarming first inc only, value must be under limit plus inc minus deadband
				if (OPP_first_loinc == TRUE) {

					// if value is greater than lo limit minus inc limit plus the deadband, clear existing incremental alarm
					if (alarm_fields.analog_val > (lo_limit - lo_inc + alarm_fields.deadband_l)) {

						// if lolo is possible, set lolo alarm
						if (lolo_flag == TRUE) {
							bit_op_mask  |= 0x0007;
							bit_val_mask |= 0x0001;	// ilo = 1
							bit_val_mask &= 0xFFF9;	// alo = 0, ihi
						}

						// else clear incs, point will go to lo alarm
						else {
							bit_op_mask  |= 0x0003;
							bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
						}
						togl_flag = TRUE;
					}
				}

				// else alarming all incrementals
				else {

					// if previously had an inc alarm, clear the inc to lo or lolo
					if ((alarm_fields.firstStatus & 0x0003) != 0x0000) {

						// if lolo is possible, set lolo alarm
						if (lolo_flag == TRUE) {
							bit_op_mask  |= 0x0007;
							bit_val_mask |= 0x0001;	// ilo = 1
							bit_val_mask &= 0xFFF9;	// alo = 0, ihi = 0
						}

						// else clear incs, point will go to lo alarm
						else {
							bit_op_mask  |= 0x0003;
							bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
						}
						togl_flag = TRUE;
					}
				}
			}

			// else newinc must be less than zero, which means an inc alarm condition exists
			else {

				// if all incs are alarmed, set lo better alarm
				if (OPP_first_loinc == FALSE) {
					bit_op_mask  |= 0x0003;
					bit_val_mask |= 0x0001;	// ilo = 1
					bit_val_mask &= 0xFFFD;	// ihi = 0
					togl_flag = TRUE;
				}
				else
					new_prev_flag = TRUE;
			}
		}
	}

return [togl_flag, new_prev_flag, bit_op_mask, bit_val_mask];
} // opp_a_loinc

/*****************************************************************************
 *
 * This module is the co-ordinator of the limit checks that are performed
 * on the given analog point data
 *
 * input:
 *    alarm_fields   - alarm related record fields from pnt
 * output:
 *    new_prev_flag      - returned flag denotes set PV value
 *    clear_release      - retunred flag denotes if relase bit needs cleared
 *    bit_op_mask        - bit modify operations mask
 *    bit_val_mask       - bit modify values mask
 *    inhibit_cutout_bit - returned to denote inhibit after cut
 *    new_signf_flag     - returned flag denotes if alsrm signf needs set
 *    delay_flag         - returned flag denotes if alarm is to be delayed
 *
 ******************************************************************************/
function opp_a_limck(alarm_fields, new_prev_flag, clear_release, bit_op_mask, bit_val_mask, inhibit_cutout_bit, new_signf_flag, delay_flag) {
	var togl_flag = FALSE;		// denotes if alarm state has changed
	var cutout_flag = FALSE;	// denotes if point is cut from alarm
	var inhibit_flag = FALSE;	// denotes alarm inhibit after cutout
	var newinc = 0;				// current incremental alarm value
	var oldinc = 0;				// previous incremental alarm value
	var temp_stat;				// temp status word to check alarm delays

	var hihi_flag;				// denotes if hihi alarms are possible
	var lolo_flag;				// denotes if lolo alarms are possible
	var check_inc;				// flags if inc alarms need checked
	var was_hi;					// indicates extreme alarm, prev pass was hi
	var was_lo;					// indicates extreme alarm, prev pass was lo
	var now_hi;					// indicates extreme alarm, this pass was hi
	var now_lo;					// indicates extreme alarm, this pass was lo

	// determine if hihi and lolo alarms are possible
	if (alarm_fields.hihi_limit > alarm_fields.hi_limit)
		hihi_flag = TRUE;
	else
		hihi_flag = FALSE;

	if (alarm_fields.lolo_limit < alarm_fields.lo_limit)
		lolo_flag = TRUE;
	else
		lolo_flag = FALSE;

	// set flags for hi or lo previous alarm
	if (((alarm_fields.firstStatus & 0x000C) == 0x0008) ||		// hi or hi-inc alarm
		((alarm_fields.firstStatus & 0x000F) == 0x0002))		// hi-hi alarm
		was_hi = TRUE;
	else
		was_hi = FALSE;

	if (((alarm_fields.firstStatus & 0x000C) == 0x0004) ||		// lo or lo-inc alarm
		((alarm_fields.firstStatus & 0x000F) == 0x0001))		// lo-lo alarm
		was_lo = TRUE;
	else
		was_lo = FALSE;

	// if scan off or no sensor alarm condition, do the limit check
	if (((alarm_fields.firstStatus & 0x0800) != 0x0000) || ((alarm_fields.secondStatus & 0x0001) == 0x0000)) {

		// check for cutout and "inhibit alarm after cutout" alarming situation
		if ((alarm_fields.firstStatus & 0x3040) != 0x0000)
			cutout_flag = TRUE;
		if (((alarm_fields.lc_field & 0x7) == 7) || ((alarm_fields.lc_field & 0x07) == 6))
			inhibit_flag = TRUE;
		if ((cutout_flag == TRUE) && (inhibit_flag == TRUE)) {
			inhibit_cutout_bit = 1;
			new_prev_flag = TRUE;
		}

		// determine if limit checking is to be performed. limit checks may be disabled through the
		// LC record field, or by turning limit checking off in the status word via a point command
		if (((alarm_fields.lc_field & 0x07) == 5) || ((alarm_fields.firstStatus & 0x1000) != 0))
			return [new_prev_flag, clear_release, bit_op_mask, bit_val_mask, inhibit_cutout_bit, new_signf_flag, delay_flag];

		// if not "inhibit after cutout" alarm, or inhibit alarm and no longer cut, check alarms
		if ((inhibit_flag == FALSE) ||
			((inhibit_flag == TRUE) && (cutout_flag == FALSE) && ((alarm_fields.secondStatus & 0x1000) == 0x0000))) {

			// if was previously in sensor alarm, clear the sensor alarm
			if ((alarm_fields.firstStatus & 0x000C) == 0x000C) {
				bit_op_mask  |= 0x000C;
				bit_val_mask &= 0xFFF3;	// ahi = 0, alo = 0

				// apply changes to local copy of status word
				alarm_fields.firstStatus = opp_modify_bit_values(alarm_fields.firstStatus, bit_op_mask, bit_val_mask);
			}

			// if only checking sensor alarms, no need to continue
			if ((alarm_fields.lc_field & 0x07) == 0)
				return [new_prev_flag, clear_release, bit_op_mask, bit_val_mask, inhibit_cutout_bit, new_signf_flag, delay_flag];

			// if no previous alarms, check for hi, hi hi or lo, lo lo alarms if those checks enabled
			if ((alarm_fields.firstStatus & 0x000F) == 0x0000) {	// no prev alarm cond
				if ((alarm_fields.lc_field & 0x10) == 0) {			// LC.b4
					[togl_flag, bit_op_mask, bit_val_mask] = opp_a_hilim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask);
					[togl_flag, bit_op_mask, bit_val_mask] = opp_a_hihilim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask);
				}
				if ((alarm_fields.lc_field & 0x08) == 0) {			// LC.b3
					[togl_flag, bit_op_mask, bit_val_mask] = opp_a_lolim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask);
					[togl_flag, bit_op_mask, bit_val_mask] = opp_a_lololim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask);
				}
				new_prev_flag = TRUE;

				// if was in alarm or released, must have been in sensor alarm, this is an alarm toggle
				if (((alarm_fields.firstStatus & 0x0080) != 0x0000) || ((alarm_fields.secondStatus & 0x0080) != 0x0000))
					togl_flag = TRUE;
			}

			// else point was previously in alarm, check if still in alarm and possibly incremental alarm
			else {

				// if enabled, do hi alarm check
				if ((alarm_fields.lc_field & 0x10) == 0) {		// LC.b4
					if (hihi_flag == TRUE) {
						[togl_flag, bit_op_mask, bit_val_mask] = opp_a_hihilim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask);
						alarm_fields.firstStatus = opp_modify_bit_values(alarm_fields.firstStatus, bit_op_mask, bit_val_mask);
					}
					[togl_flag, bit_op_mask, bit_val_mask] = opp_a_hilim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask);
				}

				// else clear hi alarm and possible hihi alarms since they are not checked
				else {

					// clear hi alarm always
					bit_op_mask  |= 0x0008;
					bit_val_mask &= 0xFFF7;	// ahi = 0

					// if alarm is a hihi alarm, clear it
					if ((alarm_fields.firstStatus & 0x000F) == 0x0002) {
						bit_op_mask  |= 0x0002;
						bit_val_mask &= 0xFFFD;	// ihi = 0
					}

					// if alarm is any hi inc alarm, clear it
					if (((alarm_fields.firstStatus & 0x000C) == 0x0008) &&
						((alarm_fields.firstStatus & 0x0003) != 0x0000)) {
						bit_op_mask  |= 0x0003;
						bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
					}
				}

				// apply changes to local copy of status word
				alarm_fields.firstStatus = opp_modify_bit_values(alarm_fields.firstStatus, bit_op_mask, bit_val_mask);

				// detemine need for hi inc checking
				check_inc = FALSE;

				// if hihi possible, must be in hihi or hi inc prior to checking inc alarm
				if (hihi_flag == TRUE) {
					if (((alarm_fields.firstStatus & 0x000C) == 0x0008) &&
						((alarm_fields.firstStatus & 0x0003) != 0x0000))		// hi inc alarm
						check_inc = TRUE;
					if ((alarm_fields.firstStatus & 0x000F) == 0x0002)			// hihi alarm
						check_inc = TRUE;
					if ((check_inc == FALSE) && (was_lo == TRUE)) {				// any lo to hi or hihi
						if (((alarm_fields.firstStatus & 0x000C) == 0x0008) ||	// hi alarm
							((alarm_fields.firstStatus & 0x000F) == 0x0002))	// hi-hi alarm
							togl_flag = TRUE;
					}
				}

				// else hihi not possible, else check incremental alarm for any hi alarm
				else {
					if ((alarm_fields.firstStatus & 0x0008) != 0x0000)
						check_inc = TRUE;
				}

				// if needed, check hi incremental
				if (check_inc == TRUE) {

					// if enabled, do the hi inc check
					if ((alarm_fields.lc_field & 0x40) == 0)	// LC.b6
						[togl_flag, new_prev_flag, bit_op_mask, bit_val_mask] = opp_a_hiinc(alarm_fields, togl_flag, new_prev_flag, bit_op_mask, bit_val_mask);

					// else clear hi inc alarms since they are not checked
					else {
						if (((alarm_fields.firstStatus & 0x000C) == 0x0008) &&		// hi better or hi worse
							((alarm_fields.firstStatus & 0x0003) != 0x0000)) {
							// if hihi is possible, set hihi alarm
							if (hihi_flag == TRUE) {
								bit_op_mask  |= 0x000B;
								bit_val_mask |= 0x0002;	// ihi = 1
								bit_val_mask &= 0xFFF6;	// ahi = 0, ilo = 0
							}

							// else hihi not possible, clear incs will cause hi alarm
							else {
								bit_op_mask  |= 0x0003;
								bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
							}

							// toggle alarm for either case
							togl_flag = TRUE;
						}
					}
				}

				// apply changes to local copy of status word
				alarm_fields.firstStatus = opp_modify_bit_values(alarm_fields.firstStatus, bit_op_mask, bit_val_mask);

				// if enabled, do lo alarm check
				if ((alarm_fields.lc_field & 0x08) == 0) {		// LC.b3
					if (lolo_flag == TRUE) {
						[togl_flag, bit_op_mask, bit_val_mask] = opp_a_lololim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask);
						alarm_fields.firstStatus = opp_modify_bit_values(alarm_fields.firstStatus, bit_op_mask, bit_val_mask);
					}
					[togl_flag, bit_op_mask, bit_val_mask] = opp_a_lolim(alarm_fields, togl_flag, bit_op_mask, bit_val_mask);
				}

				// else clear lo alarm and possible lolo alarms since they are not checked
				else {

					// clear lo alarm always
					bit_op_mask  |= 0x0004;
					bit_val_mask &= 0xFFFB;	// alo = 0

					// if alarm is a lolo alarm, clear it
					if ((alarm_fields.firstStatus & 0x000F) == 0x0001) {
						bit_op_mask  |= 0x0001;
						bit_val_mask &= 0xFFFE;	// ilo = 0
					}

					// if alarm is any lo inc alarm, clear it
					if (((alarm_fields.firstStatus & 0x000C) == 0x0004) &&
						((alarm_fields.firstStatus & 0x0003) != 0x0000)) {
							bit_op_mask  |= 0x0003;
							bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
					}
				}

				// apply changes to local copy of status word
				alarm_fields.firstStatus = opp_modify_bit_values(alarm_fields.firstStatus, bit_op_mask, bit_val_mask);

				// determine need for low inc check
				check_inc = FALSE;

				// if lolo possible, must be in lolo or lo inc prior to checking inc alarm
				if (lolo_flag == TRUE) {
					if (((alarm_fields.firstStatus & 0x000C) == 0x0004) &&		// lo inc
						((alarm_fields.firstStatus & 0x0003) != 0x0000))
						check_inc = TRUE;
					if ((alarm_fields.firstStatus & 0x000F) == 0x0001)			// lo lo
						check_inc = TRUE;
					if ((check_inc == FALSE) && (was_hi == TRUE)) {				// any hi to lo or lolo
						if (((alarm_fields.firstStatus & 0x000C) == 0x0004) ||	// lo alarm
							((alarm_fields.firstStatus & 0x000F) == 0x0001))	// lo-lo alarm
							togl_flag = TRUE;
					}
				}

				// else check incs for any lo alarm
				else {
					if ((alarm_fields.firstStatus & 0x0004) != 0x0000)
						check_inc = TRUE;
				}

				// if needed, check low incremental alarm
				if (check_inc == TRUE) {

					// if enabled, do the lo inc check
					if ((alarm_fields.lc_field & 0x20) == 0)	// LC.b5
						[togl_flag, new_prev_flag, bit_op_mask, bit_val_mask] = opp_a_loinc(alarm_fields, togl_flag, new_prev_flag, bit_op_mask, bit_val_mask);

					// else clear the low incrementals since they are not checked
					else {
						if (((alarm_fields.firstStatus & 0x000C) == 0x0004) &&	// lo better or lo worse
							((alarm_fields.firstStatus & 0x0003) != 0x0000)) {

							// if lolo is possible, set lolo alarm
							if (lolo_flag == TRUE) {
								bit_op_mask  |= 0x0007;
								bit_val_mask |= 0x0001;	// ilo = 1
								bit_val_mask &= 0xFFF9;	// alo = 0, ihi = 0
							}

							// else lolo not possible, clear incs will cause lo alarm
							else {
								bit_op_mask  |= 0x0003;
								bit_val_mask &= 0xFFFC;	// ihi = 0, ilo = 0
							}

							// toggle alarm for either case
							togl_flag = TRUE;
						}
					}
				}

				// apply changes to local copy of status word
				alarm_fields.firstStatus = opp_modify_bit_values(alarm_fields.firstStatus, bit_op_mask, bit_val_mask);

				// if the current alarm signf does not equal configured signf, this is an alarm toggle
				if ((((alarm_fields.firstStatus & 0x0010) != 0x0000) && ((alarm_fields.secondStatus & 0x0040) == 0x0000)) ||
					(((alarm_fields.firstStatus & 0x0010) == 0x0000) && ((alarm_fields.secondStatus & 0x0040) != 0x0000)))
					togl_flag = TRUE;

				// if we have an extreme alarm change, we must be sure we have a toggle
				if (((alarm_fields.firstStatus & 0x000C) == 0x0008) ||	// hi or hi-inc alarm
					((alarm_fields.firstStatus & 0x000F) == 0x0002))	// hi-hi alarm
					now_hi = TRUE;
				else
					now_hi = FALSE;
				if (((alarm_fields.firstStatus & 0x000C) == 0x0004) ||	// lo or lo-inc alarm
					((alarm_fields.firstStatus & 0x000F) == 0x0001))	// lo-lo alarm
					now_lo = TRUE;
				else
					now_lo = FALSE;
				if (((was_hi == TRUE) && (now_lo == TRUE)) || ((was_lo == TRUE) && (now_hi == TRUE)))
					togl_flag = TRUE;
			}

			// if alarm state changed, and set the alarming bits accordingly
			if (togl_flag == TRUE) {

				// set flag to get new alarm significance
				new_signf_flag = TRUE;

				// set flag to save value as previous value
				new_prev_flag = TRUE;

				// set alarm ack bit
				bit_op_mask |= _1W_UNACK_BIT;
				bit_val_mask |= _1W_UNACK_BIT;

				// if alarm is released, unrelease it and set alarm bit
				if ((alarm_fields.secondStatus & 0x0080) != 0) {
					bit_op_mask |= 0x0080;
					bit_val_mask |= 0x0080;
					clear_release = TRUE;
				}

				// toggle value of toggle bit
				bit_op_mask |= 0x4000;
				if ((alarm_fields.firstStatus & 0x4000) != 0)
					bit_val_mask &= 0xBFFF;
				else
					bit_val_mask |= 0x4000;
			}
		}
		temp_stat = orig_firstStatus;
		temp_stat = opp_modify_bit_values(temp_stat, bit_op_mask, bit_val_mask);

		// if alarm delay is applied, and point is a new alarm or an alarm toggle, and not a sensor alarm, delay the alarm
		if (((alarm_fields.secondStatus & 0x8000) != 0x0000) && ((temp_stat & 0x000C) != 0x000C)) {
			if ((togl_flag == TRUE) || (((orig_firstStatus & 0x000F) == 0x0000) && ((temp_stat & 0x000F) != 0x0000))) {
				delay_flag = TRUE;
			}
		}

		// if alarming type is the "inhibit limit alarm after cut", do that check instead
		if ((inhibit_flag == TRUE) && (cutout_flag == FALSE) && ((alarm_fields.secondStatus & 0x1000) == 0x1000)) {

			// if value is not outside alarm limits, clear the "was cut" bit
			if ((alarm_fields.analog_val < (alarm_fields.hi_limit - alarm_fields.deadband_h)) &&
				(alarm_fields.analog_val > (alarm_fields.lo_limit + alarm_fields.deadband_l)))
				inhibit_cutout_bit = 0;

			// else value outside alarm range, do alarm check
			else {

				// if value is above hi limit, check for a hi worse incremental
				if (alarm_fields.analog_val > (alarm_fields.hi_limit - alarm_fields.deadband_h)) {

					// if hi limit and hi inc checks are not disabled, do them
					if ((alarm_fields.lc_field & 0x50) == 0) {
						newinc = ((alarm_fields.analog_val - alarm_fields.hi_limit) / alarm_fields.hiinc_limit);
						oldinc = ((alarm_fields.prev_val - alarm_fields.hi_limit) / alarm_fields.hiinc_limit);

						// if inc is worse, set hi inc alarm and clear "was cut" bit
						if (newinc > oldinc) {
							bit_op_mask |= 0x000F;
							bit_val_mask |= 0x000A;
							bit_val_mask &= 0xFFFA;
							inhibit_cutout_bit = 0;
						}
					}
				}

				// else value must be below low limit, check for lo worse incremental
				else {

					// if lo limit and lo inc checks are not disabled, do them
					if ((alarm_fields.lc_field & 0x28) == 0) {
						newinc = ((alarm_fields.analog_val - alarm_fields.lo_limit) / alarm_fields.loinc_limit);
						oldinc = ((alarm_fields.prev_val - alarm_fields.lo_limit) / alarm_fields.loinc_limit);

						// if inc is worse, set hi inc alarm and clear "was cut" bit
						if (newinc < oldinc) {
							bit_op_mask |= 0x000F;
							bit_val_mask |= 0x000A;
							bit_val_mask &= 0xFFF6;
							inhibit_cutout_bit = 0;
						}
					}
				}
			}
		}
	} // end if not sensor or scan off

	return [new_prev_flag, clear_release, bit_op_mask, bit_val_mask, inhibit_cutout_bit, new_signf_flag, delay_flag];
} // opp_a_limck

/*****************************************************************************
 *
 * This module determines the point alarm status, based on the given analog
 * point data and the results of the limit checks performed on that point
 *
 * input:
 *    alarm_fields   - alarm related record fields from pnt
 * output:
 *    get_time_flag  - denotes if alarm timestamp needs set
 *    clear_release  - denotes if alarm release bit needs cleared
 *    bit_op_mask    - bit modify operations mask
 *    bit_val_mask   - bit modify values mask
 *    new_signf_flag - denotes if alarm signf needs set
 *    clear_delay    - denotes if alarm delay bits need cleared
 * 
 ******************************************************************************/
function opp_a_aialm(alarm_fields, get_time_flag, clear_release, bit_op_mask, bit_val_mask, new_signf_flag, clear_delay) {

	// can't clear all alarms here, only if alarm off, due to sensor checking

	// if no alarming configured, alarming is off, limit checking off or alarming is cut, clear all alarm fields
	if (((alarm_fields.lc_field  & 0x07) == 0x05) ||
		((alarm_fields.firstStatus & 0x2040) != 0x0000) ||
		(((alarm_fields.firstStatus & 0x1000) != 0x0000) && ((alarm_fields.firstStatus & 0x000C) != 0x000C))) {
		bit_op_mask  |= 0x40AF;
		bit_val_mask &= 0xBF50;  // tog = 0, alm = 0, ack = 0, ahi = 0, alo = 0, ihi = 0, ilo = 0
		clear_release = TRUE;
		clear_delay = TRUE;
	}

	// else determine if new alarm or returned alarm
	else {

		// if scan off, or no sensor condition exists, do the normal alarm limit checks
		if (((alarm_fields.firstStatus & 0x0800) != 0x0000) || ((alarm_fields.secondStatus & 0x0001) == 0x0000)) {

			// if point was previously in alarm or released from alarm, check if returned from alarm
			if (((alarm_fields.firstStatus & 0x0080) != 0) || ((alarm_fields.secondStatus & 0x0080) != 0)) {

				// if not in alarm, clear toggle and alarm bits, set alarm ack bit
				if (((alarm_fields.firstStatus & 0x000C) == 0x0000)  &&	// AB - not hi, lo, hi inc, lo inc
					((alarm_fields.firstStatus & 0x000F) != 0x0001)  &&	// AB - not lo-lo
					((alarm_fields.firstStatus & 0x000F) != 0x0002)) {	// AB - not hi-hi
					bit_op_mask  |= 0x40A3;
					bit_val_mask |= _1W_UNACK_BIT;  // ack = 1
					bit_val_mask &= 0xBF7C;  // tog = 0, alm = 0,  ihi = 0; ilo = 0
					clear_release = TRUE;
				}
			}

			// else point was not previously in alarm, check for new alarm
			else {

				// if in alarm, set alarm, alarm ack bits and clear toggle bits, set alarm time
				if (((alarm_fields.firstStatus & 0x000C) != 0x0000)  ||	// AB - hi, lo, hi inc, lo inc
					((alarm_fields.firstStatus & 0x000F) == 0x0001)  ||	// AB - lo-lo
					((alarm_fields.firstStatus & 0x000F) == 0x0002)) {	// AB - hi-hi
					bit_op_mask  |= 0x40A0;
					bit_val_mask |= 0x00A0;	// alm = 1, ack = 1
					bit_val_mask &= 0xBFFF;	// tog = 0
					clear_release = TRUE;
					get_time_flag = TRUE;
					new_signf_flag = TRUE;
				}
			}
		}

		// else a sensor alarm condition exists, set sensor alarm
		else {

			// if point was previously in alarm or released from alarm, check for a normal-to-sensor alarm toggle
			/*
			 * Если точка ранее находилась в состоянии тревоги или была отключена от тревоги,
			 * проверьте переключение между нормальным и сенсорным сигналом тревоги
			*/
			if (((alarm_fields.firstStatus & 0x0080) != 0) || ((alarm_fields.secondStatus & 0x0080) != 0)) {

				// if not already in sensor alarm, toggle alarm
				if ((alarm_fields.firstStatus & 0x000C) != 0x000C) {
					clear_release = TRUE;
					new_signf_flag = TRUE;
					clear_delay = TRUE;
					bit_op_mask |= 0x40AF;
					bit_val_mask |= 0x00AC;
					if ((alarm_fields.firstStatus & 0x4000) != 0)
						bit_val_mask &= 0xBFFF;
					else
						bit_val_mask |= 0x4000;
				}

				// else already in sensor alarm, check for change in alarm signficance
				else {
					if ((((alarm_fields.firstStatus & 0x0010) != 0x0000) && ((alarm_fields.secondStatus & 0x0040) == 0x0000)) ||
						(((alarm_fields.firstStatus & 0x0010) == 0x0000) && ((alarm_fields.secondStatus & 0x0040) != 0x0000))) {

						// if alarm is released, unrelease it and set alarm bit
						if ((alarm_fields.secondStatus & 0x0080) != 0) {
							bit_op_mask |= 0x0080;
							bit_val_mask |= 0x0080;
							clear_release = TRUE;
						}
						new_signf_flag = TRUE;
						bit_op_mask |= 0x4020;
						bit_val_mask |= _1W_UNACK_BIT;
						if ((alarm_fields.firstStatus & 0x4000) != 0)
							bit_val_mask &= 0xBFFF;
						else
							bit_val_mask |= 0x4000;
					}
				}
			}

			// else point was not in alarm, set alarm, sensor, ack bits, clear toggle, inc bits, clear delay and release
			else {
				bit_op_mask |= 0x40AF;
				bit_val_mask |= 0x00AC;
				get_time_flag = TRUE;
				new_signf_flag = TRUE;
				clear_delay = TRUE;
				clear_release = TRUE;
			}
		}
	}
	return [get_time_flag, clear_release, bit_op_mask, bit_val_mask, new_signf_flag, clear_delay];
} // opp_a_aialm

/*****************************************************************************
 *
 * see module header
 *
 ******************************************************************************/
function opp_analog_alarms(pt_name) {

	var alarm_fields = {		// alarm related data from point record
		'analog_val'	: 0.0,	// AV - Analog Current Value
		'prev_val'		: 0.0,	//    - Previous Input Value

		'firstStatus'	: 0,	// 1W - Analog Status Word
		'secondStatus'	: 0,	// 2W - Second Status Word

		'lc_field'		: 0,	//    - Include Limit Checking

		'hihi_limit'	: 0.0,	// ZH - High-High Alarm Limit					(ВАГ) Максимальный верхний предел
		'hi_limit'		: 0.0,	// HL - High Alarm Limit						(ВРГ) Верхний предел значения параметра
		'lo_limit'		: 0.0,	// LL - Low Alarm Limit							(НРГ) Нижний предел значения параметра
		'lolo_limit'	: 0.0,	// ZL - Low-Low Alarm Limit						(НАГ) Минимальный нижний предел

		'hiinc_limit'	: 0.0,	// ZI - High Alarm Incremental Limit			Верхний шаг контроля тенденции
		'loinc_limit'	: 0.0,	// ZM - Low Alarm Incremental Limit				Нижний шаг контроля тенденции

		'deadband_h'	: 0.0,	// DB - High/Incremental Limit Deadband			Зона нечувствительности контроля
		'deadband_l'	: 0.0,	// DJ - Low/Incremental Limit Deadband			Зона нечувствительности контроля
	};

	var bit_op_mask;		// bit modify operations mask
	var bit_val_mask;		// bit modify value mask
	var get_time_flag;		// denotes if alarm timestamp needs set
	var new_prev_flag;		// denotes if new PV value needs set
	var clear_release;		// denotes if alarm release bit needs cleared
	var inhibit_cutout_bit;	// denotes inhibit alarm after cutout
	var stat2_op_mask;		// bit modify operation mask - 2nd stat word
	var stat2_val_mask;		// bit modify value mask - 2nd stat word
	var err_stat;			// return status from subroutines
	var new_prev_val;		// analog value read from AV, stored in PV
	var new_signf_flag;		// denotes if new alarm signf needs set
	var delay_flag;			// denotes if alarm is being delayed
	var clear_delay;		// denotes if delay needs cleared due to cut or alarms off
	var new_firstStatus;	// used to check if alarm type bits are changing

	// init alarm data structure
	alarm_fields.lc_field		= 0;
	alarm_fields.firstStatus	= 0;
	alarm_fields.secondStatus	= 0;
	alarm_fields.analog_val		= 0.0;

	alarm_fields.hihi_limit		= 0.0;
	alarm_fields.hi_limit		= 0.0;
	alarm_fields.lo_limit		= 0.0;
	alarm_fields.lolo_limit		= 0.0;

	alarm_fields.hiinc_limit	= 0.0;
	alarm_fields.loinc_limit	= 0.0;

	alarm_fields.deadband_h		= 0.0;
	alarm_fields.deadband_l		= 0.0;

	alarm_fields.prev_val		= 0.0;

	// local function

	function l_getLC_FIELD(pt_name) { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name].LC_FIELD); };
	function l_get1W(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._1W); };
	function l_get2W(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._2W); };
	function l_getAV(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._AV); };
	function l_getHL(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._HL); };
	function l_getZH(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._ZH); };
	function l_getLL(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._LL); };
	function l_getZL(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._ZL); };
	function l_getZI(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._ZI); };
	function l_getZM(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._ZM); };
	function l_getDB(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._DB); };
	function l_getDJ(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._DJ); };
	function l_getPREVAL(pt_name)   { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name].PREVAL); };

	function l_setLC_FIELD(pt_name, val) { if (SHC["_" + pt_name]) SHC["_" + pt_name].LC_FIELD = val + ''; };
	function l_set1W(pt_name, val)       { if (SHC["_" + pt_name]) SHC["_" + pt_name]._1W = val + ''; };
	function l_set2W(pt_name, val)       { if (SHC["_" + pt_name]) SHC["_" + pt_name]._2W = val + ''; };
	function l_setPREVAL(pt_name, val)   { if (SHC["_" + pt_name]) SHC["_" + pt_name].PREVAL = val + ''; };

	// read the alarm related record fields

	if ( isNaN(l_getLC_FIELD(pt_name)) ) {

		// Include Limit Checking
		// LC.bit3 - (LL and ZL) Low alarm checking is disabled (=1)
		// LC.bit4 - (HL and ZH) High alarm checking is disabled (=1)
		// LC.bit5 - (ZM) Low incremental alarm checking is disabled (=1)
		// LC.bit6 - (ZI) High incremental alarm checking is disabled (=1)
		// нет проверки пределов = 121 = 0111_1001
		alarm_fields.lc_field =   121;

		if ( !(isNaN(l_getLL(pt_name)) && isNaN(l_getZL(pt_name))) )
			// сбросить LC.bit3 в 0 - разрешить проверку нижних пределов
			alarm_fields.lc_field = opp_modify_bit_values(alarm_fields.lc_field,
				STATUSWORD['OFF3'].MASK, STATUSWORD['OFF3'].PATTERN);

		if ( !(isNaN(l_getHL(pt_name)) && isNaN(l_getZH(pt_name))) )
			// сбросить LC.bit4 в 0 - разрешить проверку верхних пределов
			alarm_fields.lc_field = opp_modify_bit_values(alarm_fields.lc_field,
				STATUSWORD['OFF4'].MASK, STATUSWORD['OFF4'].PATTERN);

		if ( !(isNaN(l_getZM(pt_name))) )
			// сбросить LC.bit5 в 0 - разрешить проверку нижних пределов тенденции изменения
			alarm_fields.lc_field = opp_modify_bit_values(alarm_fields.lc_field,
				STATUSWORD['OFF5'].MASK, STATUSWORD['OFF5'].PATTERN);

		if ( !(isNaN(l_getZI(pt_name))) )
			// сбросить LC.bit6 в 0 - разрешить проверку верхних пределов тенденции изменения
			alarm_fields.lc_field = opp_modify_bit_values(alarm_fields.lc_field,
				STATUSWORD['OFF6'].MASK, STATUSWORD['OFF6'].PATTERN);

		l_setLC_FIELD(pt_name, alarm_fields.lc_field);
	} else {
		alarm_fields.lc_field = Number(SHC["_" + pt_name].LC_FIELD);
	}

	alarm_fields.firstStatus  = l_get1W ( pt_name );
	alarm_fields.secondStatus = l_get2W ( pt_name );
	alarm_fields.analog_val   = l_getAV ( pt_name );

	alarm_fields.hihi_limit   = l_getZH ( pt_name );
	alarm_fields.hi_limit     = l_getHL ( pt_name );
	alarm_fields.lo_limit     = l_getLL ( pt_name );
	alarm_fields.lolo_limit   = l_getZL ( pt_name );

	alarm_fields.hiinc_limit  = l_getZI ( pt_name );
	alarm_fields.loinc_limit  = l_getZM ( pt_name );

	alarm_fields.deadband_h   = l_getDB ( pt_name );
	alarm_fields.deadband_l   = l_getDJ ( pt_name );

	alarm_fields.prev_val     = l_getPREVAL ( pt_name );

	if ( isNaN(alarm_fields.firstStatus )) alarm_fields.firstStatus  = 0;
	if ( isNaN(alarm_fields.secondStatus)) alarm_fields.secondStatus = 0;
	if ( isNaN(alarm_fields.analog_val  )) alarm_fields.analog_val   = 0.0;

	if ( isNaN(alarm_fields.hihi_limit  )) alarm_fields.hihi_limit   = +99999.0;							// ZH
	if ( isNaN(alarm_fields.hi_limit    )) alarm_fields.hi_limit     = alarm_fields.hihi_limit - 0.00001;	// HL

	if ( isNaN(alarm_fields.lolo_limit  )) alarm_fields.lolo_limit   = -99999.0;							// ZL
	if ( isNaN(alarm_fields.lo_limit    )) alarm_fields.lo_limit     = alarm_fields.lolo_limit + 0.00001;	// LL

	if ( isNaN(alarm_fields.hiinc_limit )) alarm_fields.hiinc_limit  = 0.0;
	if ( isNaN(alarm_fields.loinc_limit )) alarm_fields.loinc_limit  = 0.0;

	if ( isNaN(alarm_fields.deadband_h  )) alarm_fields.deadband_h   = 0.0;
	if ( isNaN(alarm_fields.deadband_l  )) alarm_fields.deadband_l   = 0.0;

	if ( isNaN(alarm_fields.prev_val    )) alarm_fields.prev_val     = alarm_fields.analog_val;

//	console.info(pt_name, alarm_fields);

	orig_firstStatus = alarm_fields.firstStatus;

	// perform limit checks and set alarm condition bits
	bit_op_mask = 0x0000;
	bit_val_mask = 0x0000;
	new_prev_flag = FALSE;
	clear_release = FALSE;
	inhibit_cutout_bit = -1;
	new_signf_flag = FALSE;
	delay_flag = FALSE;
	clear_delay = FALSE;
	[new_prev_flag, clear_release, bit_op_mask, bit_val_mask, inhibit_cutout_bit, new_signf_flag, delay_flag] = opp_a_limck(alarm_fields, new_prev_flag, clear_release, bit_op_mask, bit_val_mask, inhibit_cutout_bit, new_signf_flag, delay_flag);

	// check if alarm is being delayed, must ingore new alarm or toggle
	// Проверить, не задерживается ли сигнализация, должен ли поступить новый сигнал тревоги или переключения
	if (delay_flag == TRUE) {
		new_prev_flag = FALSE;
		new_signf_flag = FALSE;
		clear_release = FALSE;
		bit_op_mask = 0x0000;
	}

	// do the point alarming - must apply changes from limit check to status value
	if (bit_op_mask != 0x0000)
		alarm_fields.firstStatus = opp_modify_bit_values(alarm_fields.firstStatus, bit_op_mask, bit_val_mask);

	if (clear_release == TRUE)
		alarm_fields.secondStatus &= 0xFF7F;

	get_time_flag = FALSE;

	[get_time_flag, clear_release, bit_op_mask, bit_val_mask, new_signf_flag, clear_delay] = opp_a_aialm(alarm_fields, get_time_flag, clear_release, bit_op_mask, bit_val_mask, new_signf_flag, clear_delay);

	// check if a new previous value shoud be stored in the PV field
	if (new_prev_flag == TRUE) {
		new_prev_val = alarm_fields.analog_val;
		l_setPREVAL(pt_name, new_prev_val);			// PREVAL - Previous Input Value
	}

	// if needed, get the alarm significance value
	if (new_signf_flag == TRUE) {
		bit_op_mask |= 0x0010;
		if ((alarm_fields.secondStatus & 0x0040) != 0x0000)
			bit_val_mask |= 0x0010;
		else
			bit_val_mask &= 0xFFEF;
	}

	// if needed, update the status word in the point record
	if (bit_op_mask != 0x0000) {
		// if only changing alarm type bits, check if changed since these bits always getting set in the limit checks
		if ((bit_op_mask & 0xFFF0) == 0x0000) {
			new_firstStatus = orig_firstStatus;
			//(void) opp_modify_bit_values(&new_firstStatus, bit_op_mask, bit_val_mask);
			new_firstStatus = opp_modify_bit_values(new_firstStatus, bit_op_mask, bit_val_mask);
			if (new_firstStatus != orig_firstStatus) {
				//(void) shc_modify_bit_values((char*)pt_name,(char*)"AS", bit_op_mask, bit_val_mask);	// AS Analog Status Word
				let current_stat = l_get1W ( pt_name );
				let new_stat = current_stat;
				new_stat = opp_modify_bit_values(new_stat, bit_op_mask, bit_val_mask);
				if (current_stat != new_stat)
					l_set1W(pt_name, new_stat);		// 1W - Analog Status Word
			}
		}

		// else have a definite change in alarm, change the status bits
		else {
			//(void) shc_modify_bit_values((char*)pt_name,(char*)"AS", bit_op_mask, bit_val_mask);		// AS Analog Status Word
			let current_stat = l_get1W ( pt_name );
			let new_stat = current_stat;
			new_stat = opp_modify_bit_values(new_stat, bit_op_mask, bit_val_mask);
			if (current_stat != new_stat)
				l_set1W(pt_name, new_stat);			// 1W - Analog Status Word
		}
	}

	stat2_op_mask = 0x0000;
	stat2_val_mask = 0x0000;

	// if alarm delay is cleared to to cut or alarms off, clear all delay bits
	if (clear_delay == TRUE) {
		stat2_op_mask |= 0xA000;
		stat2_val_mask &= 0x5FFF;
	}

	// else do normal alarm delay function
	else {
		if ((delay_flag == TRUE) && ((alarm_fields.secondStatus & 0x2000) != 0x2000)) {
			stat2_op_mask |= 0x2000;
			stat2_val_mask |= 0x2000;
		}

		if ((delay_flag == FALSE) && ((alarm_fields.secondStatus & 0x2000) != 0x0000)) {
			stat2_op_mask |= 0x2000;
			stat2_val_mask &= 0xDFFF;
		}
	}

	// if inhibit after cutout, set bit in second status word
	if (inhibit_cutout_bit != -1) {
		stat2_op_mask |= 0x1000;
		if (inhibit_cutout_bit == 1)
			stat2_val_mask |= 0x1000;
		else
			stat2_val_mask &= 0xEFFF;
	}

	// if alarm release is cleared, clear bit in second status word
	if (clear_release == TRUE) {
		stat2_op_mask |= 0x0080;
		stat2_val_mask &= 0xFF7F;
	}

	// update the second status word in the point record
	if (stat2_op_mask != 0x0000) {
		//(void) shc_modify_bit_values((char*)pt_name,(char*)"AW", stat2_op_mask, stat2_val_mask);		// AW I 12 Second Status Word
		let current_stat = l_get2W ( pt_name );
		let new_stat = current_stat;
		new_stat = opp_modify_bit_values(new_stat, stat2_op_mask, stat2_val_mask);
		if (current_stat != new_stat)
			l_set2W(pt_name, new_stat);				// 2W - Second Status Word
	}

} // opp_analog_alarms

/*****************************************************************************
 *
 * Acknowledge alarm
 * Квитировать (подтвердить) сигнализацию
 *
 ******************************************************************************/
function opp_acknowledge_alarm(pt_name) {

	// convert an integer to binary string
	function dec2bin(dec) { let str = (dec >>> 0).toString(2); return str.padStart(16, "0"); };

	function l_get1W(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._1W); };
	function l_set1W(pt_name, val)  { if (SHC["_" + pt_name]) SHC["_" + pt_name]._1W = val + ''; };

	function l_get2W(pt_name)       { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._2W); };
	function l_set2W(pt_name, val)  { if (SHC["_" + pt_name]) SHC["_" + pt_name]._2W = val + ''; };

	let RecordTypeNumber = getRT(pt_name);
	let op_mask;
	let val_mask;
	let current_stat;
	let new_stat;

	switch (RecordTypeNumber) {
		// Аналоговый параметр
		case 91:
			op_mask = _1W_UNACK_BIT;
			val_mask = 0x0000;
			current_stat = l_get1W (pt_name);
			new_stat = current_stat;
			new_stat = opp_modify_bit_values(new_stat, op_mask, val_mask);
			l_set1W(pt_name, new_stat);
		//	console.log("ALARM ACKNOWLEDGE: [" + pt_name + "] analog 1W: [" + dec2bin(current_stat) + "]--->[" + dec2bin(new_stat) + "]");
			console.log("ALARM ACKNOWLEDGE: [" + pt_name + "]");
			break;
		// Дискретный параметр
		case 141:
			console.log();
			op_mask = _1W_UNACK_BIT;
			val_mask = 0x0000;
			current_stat = l_get1W (pt_name);
			new_stat = current_stat;
			new_stat = opp_modify_bit_values(new_stat, op_mask, val_mask);
			l_set1W(pt_name, new_stat);
		//	console.log("ALARM ACKNOWLEDGE: [" + pt_name + "] digital 1W: [" + dec2bin(current_stat) + "]--->[" + dec2bin(new_stat) + "]");
			console.log("ALARM ACKNOWLEDGE: [" + pt_name + "]");
			break;
		// Упакованный параметр
		case 226:
			break;
		// Параметр устройства системы Ovation
		case 6:
			break;
		// Параметр алгоритма
		case 191:
			break;
		default:
			break;
	}

} // opp_acknowledge_alarm

/*****************************************************************************
 *
 * Ввод аналогового параметра в контроллер магистрали даныых Ovation (SHC)
 *
 ******************************************************************************/
function opp_analog_inject(pt_name, counter, value, is_good) {

	function l_getIV(pt_name) { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._IV); };
	function l_get1W(pt_name) { if (!(SHC["_" + pt_name])) return NaN; else return Number(SHC["_" + pt_name]._1W); };

	function l_setAV(pt_name, val)     { if (SHC["_" + pt_name]) SHC["_" + pt_name]._AV = val + ''; };
	function l_set1W(pt_name, val)     { if (SHC["_" + pt_name]) SHC["_" + pt_name]._1W = val + ''; };
	function l_set2W(pt_name, val)     { if (SHC["_" + pt_name]) SHC["_" + pt_name]._2W = val + ''; };
//	function l_set3W(pt_name, val)     { if (SHC["_" + pt_name]) SHC["_" + pt_name]._3W = val + ''; };
	function l_setPREVAL(pt_name, val) { if (SHC["_" + pt_name]) SHC["_" + pt_name].PREVAL = val + ''; };

	// начальное значение при открытии видеокадра
	if (counter == 0) {
		let current_stat = l_get1W(pt_name);	// 1W - First Analog Status
		let new_stat = current_stat;
		let intl_val = l_getIV(pt_name);
		if (isNaN(intl_val)) {
			l_setAV(pt_name, 0);			// AV - Analog Value Word
			//l_setPREVAL(pt_name, 0);
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		} else {
			l_setAV(pt_name, intl_val);	// AV - Analog Value Word
			//l_setPREVAL(pt_name, intl_val);
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['OFF15'].MASK, STATUSWORD['OFF15'].PATTERN);
		}

		if (is_good) {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['OFF15'].MASK, STATUSWORD['OFF15'].PATTERN);
		} else {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		}
		l_set1W(pt_name, new_stat);			// 1W - First Analog Status
//		l_set2W(pt_name, 0);				// 2W - Second Analog Status
//		l_set3W(pt_name, 0);				// 3W - Third Analog Status			
	}

	// значение при получении первого значения от симулятора
	if (counter == 1) {
		let current_stat = l_get1W(pt_name);	// 1W - First Analog Status
		let new_stat = current_stat;
		let intl_val = value;
		if (isNaN(intl_val)) {
			//l_setAV(pt_name, 0);		// AV - Analog Value Word
			//l_setPREVAL(pt_name, 0);
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		} else {
			l_setAV(pt_name, intl_val);	// AV - Analog Value Word
			//l_setPREVAL(pt_name, intl_val);
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['OFF15'].MASK, STATUSWORD['OFF15'].PATTERN);
		}
		l_set1W(pt_name, new_stat);			// 1W - First Analog Status

		if (is_good) {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['OFF15'].MASK, STATUSWORD['OFF15'].PATTERN);
		} else {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		}
		l_set1W(pt_name, new_stat);			// 1W - First Analog Status
	}

	// значение при получении следующего значения от симулятора
	if (counter >= 2) {
		let current_stat = l_get1W(pt_name);	// 1W - First Analog Status
		let new_stat = current_stat;
		let intl_val = value;
		if (isNaN(intl_val)) {
			//l_setAV(pt_name, 0);		// AV - Analog Value Word
			//l_setPREVAL(pt_name, 0);
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		} else {
			l_setAV(pt_name, intl_val);	// AV - Analog Value Word
			//l_setPREVAL(pt_name, intl_val);
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['OFF15'].MASK, STATUSWORD['OFF15'].PATTERN);
		}
		l_set1W(pt_name, new_stat);			// 1W - First Analog Status

		if (is_good) {
			//new_stat = opp_modify_bit_values(new_stat, STATUSWORD['NORMAL'].MASK, STATUSWORD['NORMAL'].PATTERN);
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['OFF15'].MASK, STATUSWORD['OFF15'].PATTERN);
		} else {
			new_stat = opp_modify_bit_values(new_stat, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		}
		l_set1W(pt_name, new_stat);			// 1W - First Analog Status
		opp_analog_alarms(pt_name);
	}
} // opp_analog_inject

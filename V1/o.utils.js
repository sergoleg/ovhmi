/**
 * Copyright (c) 2020 Oleg Sergeev (sergoleg@gmail.com)
 */

"use strict";

const _1W_ALARM_BITS              = 0x000F;
const _1W_INC_BITS                = 0x0003;
const _1W_BETTER_BIT              = 0x0001;
const _1W_WORSE_BIT               = 0x0002;
const _1W_LIMIT_BITS              = 0x000C;
const _1W_SENSOR_ERROR            = 0x000C;
const _1W_LOW_BIT                 = 0x0004;
const _1W_HIGH_BIT                = 0x0008;

const _1W_DIGITAL_VALUE           = 0x0001;
const _1W_PREV_DIGITAL_VALUE      = 0x0002;

const _1W_STATUS_BIT              = 0x0010;
const _1W_UNACK_BIT               = 0x0020;
const _1W_CUT_OUT                 = 0x0040;
const _1W_POINT_ALARM             = 0x0080;

const _1W_QUALITY_BITS            = 0x0300;
const _1W_BAD_QUALITY             = 0x0300;
const _1W_POOR_QUALITY            = 0x0200;
const _1W_FAIR_QUALITY            = 0x0100;
const _1W_GOOD_QUALITY            = 0x0000;

const _1W_ENTERED_BIT             = 0x0400;
const _1W_SCAN_REMOVED            = 0x0800;

const _1W_LIMIT_OFF               = 0x1000;
const _1W_DIGITAL_RELEASE         = 0x1000;

const _1W_ALARM_OFF               = 0x2000;
const _1W_TOGGLE                  = 0x4000;
const _1W_TIMED_OUT               = 0x8000;

const _1W_ALARM_MULT              = 0x00010000;
const _1W_LIMIT_NUMBER            = 0x00070000;
const _1W_LIMIT_1                 = 0x00000000;
const _1W_LIMIT_2                 = 0x00010000;
const _1W_LIMIT_3                 = 0x00020000;
const _1W_LIMIT_4                 = 0x00030000;
const _1W_INC_LIMITS              = 0x00070000;

const _1W_RESET_BIT               = 0x00080000;
const _1W_SID_ERROR               = 0x00100000;
const _1W_UDA_HIGH_LIMIT          = 0x00200000;
const _1W_UDA_LOW_LIMIT           = 0x00400000;
const _1W_REASONABILITY_LIMIT_OFF = 0x00800000;
const _1W_ENGINEERING_LIMIT_OFF   = 0x01000000;
const _1W_OUT_OF_SERVICE          = 0x20000000;

/*
#define _2W_HARDWARE_CONFIG_ERROR     0x0001
#define _2W_POWER_CHECK_ERROR	      0x0002
#define _2W_BAD_HARDWARE_STATUS       0x0004
#define _2W_QLI_ERROR                 0x0008
#define _2W_SENSOR_LIMIT_STATUS	      0x0010
#define _2W_CJC_ERROR	              0x0020
#define _2W_INFO_ALARM_CONF           0x0040

#define _2W_ALARM_RELEASED            0x0080
#define _2W_DIGITAL_CUT_OUT           0x0080

#define _2W_SENSOR_CALIBRATION_BITS   0x0300
#define _2W_UNCOMPENSATED             0x0100
#define _2W_COMPENSATED               0x0200

#define _2W_QLI_CONFIGURED            0x0400

#define _2W_QUESTIONABLE_STATUS_BIT   0x0800
#define _2W_DIG_QUALITY_LATCHED       0x0800

#define _2W_DIG_ALARM_DELAY_CONDITION 0x1000

#define _2W_ANA_ALARM_DELAY_CONDITION 0x2000
#define _2W_SOE_CHATTERING            0x2000

#define _2W_ANA_QUALITY_LATCH         0x4000
#define _2W_SOE_RE_ENABLED            0x4000

#define _2W_DELAY_ACTIVE              0x8000
*/

/*
#define _2W_REASON_NOT_DEF1                  0x00010000
#define _2W_REASON_NOT_DEF2                  0x00020000
#define _2W_REASON_TAGGED_OUT                0x00040000
#define _2W_REASON_HARDWARE_ERROR            0x00080000
#define _2W_REASON_OSCILLATING               0x00100000
#define _2W_REASON_SENSOR_CALIBRATE          0x00200000
#define _2W_REASON_TEST                      0x00400000
#define _2W_REASON_DATA_LINK_FAIL            0x00800000
#define _2W_REASON_ALGORITHM                 0x01000000
#define _2W_REASON_USER_DEFINED              0x02000000
#define _2W_REASON_SUBSTITUTED_VALUE         0x04000000
#define _2W_REASON_SCAN_REMOVE               0x08000000
#define _2W_REASON_REASONABILITY_LIMIT       0x10000000
#define _2W_REASON_ENGINEERING_LIMIT         0x20000000
#define _2W_REASON_QUAL_LATCHED              0x40000000
#define _2W_REASON_TIMED_OUT                 0x80000000
*/

/*
#define _3W_TAGGED_OUT               0x0004
#define _3W_HARDWARE_ERROR           0x0008
#define _3W_OSCILLATING_PT           0x0010
#define _3W_SENSOR_CALIBRATE         0x0020
#define _3W_TEST                     0x0040
#define _3W_DATA_LINK_FAIL           0x0080
#define _3W_ALGORITHM                0x0100
#define _3W_USER_DEFINED             0x0200
#define _3W_VALUE_CLAMPING_OFF       0x0400
#define _3W_CLAMPED                  0x0800
#define _3W_REASONABILITY_LIMIT      0x1000
#define _3W_ENGINEERING_LIMIT        0x2000
#define _3W_CUT_OUT_DISABLED         0x4000
#define _3W_COMMISSIONED             0x8000
*/

var	STATUSWORD = {

		NORMAL		:	{	MASK	:	0x8080		,	PATTERN	:	0x0000		},	// Нет сигнализации

		WORSE		:	{	MASK	:	0x8003		,	PATTERN	:	0x0002		},	// Сигнализация о выходе параметра за верхнюю аварийную границу (ВАГ)

		HIGHWORSE	:	{	MASK	:	0x808C		,	PATTERN	:	0x008A		},	// Сигнализация тенденции ухода параметра от верхней регламентной границы (ВРГ) вверх к ВАГ (ухудшение)
		HIGHBETTER	:	{	MASK	:	0x808C		,	PATTERN	:	0x0089		},	// Сигнализация тенденции возвращения параметра в верхнюю регламентную границу (ВРГ) сверху от ВАГ (улучшение)
		HIGHALARM	:	{	MASK	:	0x808C		,	PATTERN	:	0x0088		},	// Сигнализация о выходе параметра за верхнюю регламентную границу (ВРГ)

		LOWALARM	:	{	MASK	:	0x808C		,	PATTERN	:	0x0084		},	// Сигнализация о выходе параметра за нижнюю регламентную границу (НРГ)
		LOWBETTER	:	{	MASK	:	0x808C		,	PATTERN	:	0x0085		},	// Сигнализация тенденции возвращения параметра в нижнюю регламентные границы (НРГ) снизу от НАГ (улучшение)
		LOWWORSE	:	{	MASK	:	0x808C		,	PATTERN	:	0x0086		},	// Сигнализация тенденции ухода параметра от нижней регламентной границы (НРГ) снизу к НАГ (ухудшение)

		BETTER		:	{	MASK	:	0x8003		,	PATTERN	:	0x0001		},	// Сигнализация о выходе параметра за нижнюю аварийную границу (НАГ)

		SENSORALM	:	{	MASK	:	0x808C		,	PATTERN	:	0x008C		},	// Сигнализация выхода сигнала за установленный диапазон датчика устройства

		ALARMACK	:	{	MASK	:	0x8020		,	PATTERN	:	0x0020		},
		CUTOUT		:	{	MASK	:	0x8040		,	PATTERN	:	0x0040		},
		ALARM		:	{	MASK	:	0x8080		,	PATTERN	:	0x0080		},

		GOOD		:	{	MASK	:	0x8300		,	PATTERN	:	0x0000		},
		FAIR		:	{	MASK	:	0x8300		,	PATTERN	:	0x0100		},
		POOR		:	{	MASK	:	0x8300		,	PATTERN	:	0x0200		},
		BAD			:	{	MASK	:	0x8300		,	PATTERN	:	0x0300		},

		ENTERVALUE	:	{	MASK	:	0x8400		,	PATTERN	:	0x0400		},
		SCANOFF		:	{	MASK	:	0x8800		,	PATTERN	:	0x0800		},
		LIMITOFF	:	{	MASK	:	0x9000		,	PATTERN	:	0x1000		},
		ALARMOFF	:	{	MASK	:	0xA000		,	PATTERN	:	0x2000		},
		TOGGLE		:	{	MASK	:	0xC000		,	PATTERN	:	0x4000		},
		HDWRFAIL	:	{	MASK	:	0x8000		,	PATTERN	:	0x8000		},

		DROPALM		:	{	MASK	:	0x0080		,	PATTERN	:	0x0080		},
		DROPCLEAR	:	{	MASK	:	0x0080		,	PATTERN	:	0x0000		},
		DROPFAULT	:	{	MASK	:	0x0040		,	PATTERN	:	0x0040		},
		MCB0OFFLIN	:	{	MASK	:	0x0100		,	PATTERN	:	0x0100		},
		MCB1OFFLIN	:	{	MASK	:	0x0200		,	PATTERN	:	0x0200		},

		OFF0		:	{	MASK	:	0x00000001	,	PATTERN	:	0x00000000	},
		OFF1		:	{	MASK	:	0x00000002	,	PATTERN	:	0x00000000	},
		OFF2		:	{	MASK	:	0x00000004	,	PATTERN	:	0x00000000	},
		OFF3		:	{	MASK	:	0x00000008	,	PATTERN	:	0x00000000	},
		OFF4		:	{	MASK	:	0x00000010	,	PATTERN	:	0x00000000	},
		OFF5		:	{	MASK	:	0x00000020	,	PATTERN	:	0x00000000	},
		OFF6		:	{	MASK	:	0x00000040	,	PATTERN	:	0x00000000	},
		OFF7		:	{	MASK	:	0x00000080	,	PATTERN	:	0x00000000	},
		OFF8		:	{	MASK	:	0x00000100	,	PATTERN	:	0x00000000	},
		OFF9		:	{	MASK	:	0x00000200	,	PATTERN	:	0x00000000	},
		OFF10		:	{	MASK	:	0x00000400	,	PATTERN	:	0x00000000	},
		OFF11		:	{	MASK	:	0x00000800	,	PATTERN	:	0x00000000	},
		OFF12		:	{	MASK	:	0x00001000	,	PATTERN	:	0x00000000	},
		OFF13		:	{	MASK	:	0x00002000	,	PATTERN	:	0x00000000	},
		OFF14		:	{	MASK	:	0x00004000	,	PATTERN	:	0x00000000	},
		OFF15		:	{	MASK	:	0x00008000	,	PATTERN	:	0x00000000	},
		OFF16		:	{	MASK	:	0x00010000	,	PATTERN	:	0x00000000	},
		OFF17		:	{	MASK	:	0x00020000	,	PATTERN	:	0x00000000	},
		OFF18		:	{	MASK	:	0x00040000	,	PATTERN	:	0x00000000	},
		OFF19		:	{	MASK	:	0x00080000	,	PATTERN	:	0x00000000	},
		OFF20		:	{	MASK	:	0x00100000	,	PATTERN	:	0x00000000	},
		OFF21		:	{	MASK	:	0x00200000	,	PATTERN	:	0x00000000	},
		OFF22		:	{	MASK	:	0x00400000	,	PATTERN	:	0x00000000	},
		OFF23		:	{	MASK	:	0x00800000	,	PATTERN	:	0x00000000	},
		OFF24		:	{	MASK	:	0x01000000	,	PATTERN	:	0x00000000	},
		OFF25		:	{	MASK	:	0x02000000	,	PATTERN	:	0x00000000	},
		OFF26		:	{	MASK	:	0x04000000	,	PATTERN	:	0x00000000	},
		OFF27		:	{	MASK	:	0x08000000	,	PATTERN	:	0x00000000	},
		OFF28		:	{	MASK	:	0x10000000	,	PATTERN	:	0x00000000	},
		OFF29		:	{	MASK	:	0x20000000	,	PATTERN	:	0x00000000	},
		OFF30		:	{	MASK	:	0x40000000	,	PATTERN	:	0x00000000	},
		OFF31		:	{	MASK	:	0x80000000	,	PATTERN	:	0x00000000	},

		ON0			:	{	MASK	:	0x00000001	,	PATTERN	:	0x00000001	},
		ON1			:	{	MASK	:	0x00000002	,	PATTERN	:	0x00000002	},
		ON2			:	{	MASK	:	0x00000004	,	PATTERN	:	0x00000004	},
		ON3			:	{	MASK	:	0x00000008	,	PATTERN	:	0x00000008	},
		ON4			:	{	MASK	:	0x00000010	,	PATTERN	:	0x00000010	},
		ON5			:	{	MASK	:	0x00000020	,	PATTERN	:	0x00000020	},
		ON6			:	{	MASK	:	0x00000040	,	PATTERN	:	0x00000040	},
		ON7			:	{	MASK	:	0x00000080	,	PATTERN	:	0x00000080	},
		ON8			:	{	MASK	:	0x00000100	,	PATTERN	:	0x00000100	},
		ON9			:	{	MASK	:	0x00000200	,	PATTERN	:	0x00000200	},
		ON10		:	{	MASK	:	0x00000400	,	PATTERN	:	0x00000400	},
		ON11		:	{	MASK	:	0x00000800	,	PATTERN	:	0x00000800	},
		ON12		:	{	MASK	:	0x00001000	,	PATTERN	:	0x00001000	},
		ON13		:	{	MASK	:	0x00002000	,	PATTERN	:	0x00002000	},
		ON14		:	{	MASK	:	0x00004000	,	PATTERN	:	0x00004000	},
		ON15		:	{	MASK	:	0x00008000	,	PATTERN	:	0x00008000	},
		ON16		:	{	MASK	:	0x00010000	,	PATTERN	:	0x00010000	},
		ON17		:	{	MASK	:	0x00020000	,	PATTERN	:	0x00020000	},
		ON18		:	{	MASK	:	0x00040000	,	PATTERN	:	0x00040000	},
		ON19		:	{	MASK	:	0x00080000	,	PATTERN	:	0x00080000	},
		ON20		:	{	MASK	:	0x00100000	,	PATTERN	:	0x00100000	},
		ON21		:	{	MASK	:	0x00200000	,	PATTERN	:	0x00200000	},
		ON22		:	{	MASK	:	0x00400000	,	PATTERN	:	0x00400000	},
		ON23		:	{	MASK	:	0x00800000	,	PATTERN	:	0x00800000	},
		ON24		:	{	MASK	:	0x01000000	,	PATTERN	:	0x01000000	},
		ON25		:	{	MASK	:	0x02000000	,	PATTERN	:	0x02000000	},
		ON26		:	{	MASK	:	0x04000000	,	PATTERN	:	0x04000000	},
		ON27		:	{	MASK	:	0x08000000	,	PATTERN	:	0x08000000	},
		ON28		:	{	MASK	:	0x10000000	,	PATTERN	:	0x10000000	},
		ON29		:	{	MASK	:	0x20000000	,	PATTERN	:	0x20000000	},
		ON30		:	{	MASK	:	0x40000000	,	PATTERN	:	0x40000000	},
		ON31		:	{	MASK	:	0x80000000	,	PATTERN	:	0x80000000	},

		OPATTN		:	{	MASK	:	0x0010		,	PATTERN	:	0x0010		},

		PRESET0		:	{	MASK	:	0x00000001	,	PATTERN	:	0x00000000	},
		PRESET1		:	{	MASK	:	0x00000002	,	PATTERN	:	0x00000000	},
		PRESET2		:	{	MASK	:	0x00000004	,	PATTERN	:	0x00000000	},
		PRESET3		:	{	MASK	:	0x00000008	,	PATTERN	:	0x00000000	},
		PRESET4		:	{	MASK	:	0x00000010	,	PATTERN	:	0x00000000	},
		PRESET5		:	{	MASK	:	0x00000020	,	PATTERN	:	0x00000000	},
		PRESET6		:	{	MASK	:	0x00000040	,	PATTERN	:	0x00000000	},
		PRESET7		:	{	MASK	:	0x00000080	,	PATTERN	:	0x00000000	},
		PRESET8		:	{	MASK	:	0x00000100	,	PATTERN	:	0x00000000	},
		PRESET9		:	{	MASK	:	0x00000200	,	PATTERN	:	0x00000000	},
		PRESET10	:	{	MASK	:	0x00000400	,	PATTERN	:	0x00000000	},
		PRESET11	:	{	MASK	:	0x00000800	,	PATTERN	:	0x00000000	},
		PRESET12	:	{	MASK	:	0x00001000	,	PATTERN	:	0x00000000	},
		PRESET13	:	{	MASK	:	0x00002000	,	PATTERN	:	0x00000000	},
		PRESET14	:	{	MASK	:	0x00004000	,	PATTERN	:	0x00000000	},
		PRESET15	:	{	MASK	:	0x00008000	,	PATTERN	:	0x00000000	},
		PRESET16	:	{	MASK	:	0x00010000	,	PATTERN	:	0x00000000	},
		PRESET17	:	{	MASK	:	0x00020000	,	PATTERN	:	0x00000000	},
		PRESET18	:	{	MASK	:	0x00040000	,	PATTERN	:	0x00000000	},
		PRESET19	:	{	MASK	:	0x00080000	,	PATTERN	:	0x00000000	},
		PRESET20	:	{	MASK	:	0x00100000	,	PATTERN	:	0x00000000	},
		PRESET21	:	{	MASK	:	0x00200000	,	PATTERN	:	0x00000000	},
		PRESET22	:	{	MASK	:	0x00400000	,	PATTERN	:	0x00000000	},
		PRESET23	:	{	MASK	:	0x00800000	,	PATTERN	:	0x00000000	},
		PRESET24	:	{	MASK	:	0x01000000	,	PATTERN	:	0x00000000	},
		PRESET25	:	{	MASK	:	0x02000000	,	PATTERN	:	0x00000000	},
		PRESET26	:	{	MASK	:	0x04000000	,	PATTERN	:	0x00000000	},
		PRESET27	:	{	MASK	:	0x08000000	,	PATTERN	:	0x00000000	},
		PRESET28	:	{	MASK	:	0x10000000	,	PATTERN	:	0x00000000	},
		PRESET29	:	{	MASK	:	0x20000000	,	PATTERN	:	0x00000000	},
		PRESET30	:	{	MASK	:	0x40000000	,	PATTERN	:	0x00000000	},
		PRESET31	:	{	MASK	:	0x80000000	,	PATTERN	:	0x00000000	},

		PSET0		:	{	MASK	:	0x00000001	,	PATTERN	:	0x00000001	},
		PSET1		:	{	MASK	:	0x00000002	,	PATTERN	:	0x00000002	},
		PSET2		:	{	MASK	:	0x00000004	,	PATTERN	:	0x00000004	},
		PSET3		:	{	MASK	:	0x00000008	,	PATTERN	:	0x00000008	},
		PSET4		:	{	MASK	:	0x00000010	,	PATTERN	:	0x00000010	},
		PSET5		:	{	MASK	:	0x00000020	,	PATTERN	:	0x00000020	},
		PSET6		:	{	MASK	:	0x00000040	,	PATTERN	:	0x00000040	},
		PSET7		:	{	MASK	:	0x00000080	,	PATTERN	:	0x00000080	},
		PSET8		:	{	MASK	:	0x00000100	,	PATTERN	:	0x00000100	},
		PSET9		:	{	MASK	:	0x00000200	,	PATTERN	:	0x00000200	},
		PSET10		:	{	MASK	:	0x00000400	,	PATTERN	:	0x00000400	},
		PSET11		:	{	MASK	:	0x00000800	,	PATTERN	:	0x00000800	},
		PSET12		:	{	MASK	:	0x00001000	,	PATTERN	:	0x00001000	},
		PSET13		:	{	MASK	:	0x00002000	,	PATTERN	:	0x00002000	},
		PSET14		:	{	MASK	:	0x00004000	,	PATTERN	:	0x00004000	},
		PSET15		:	{	MASK	:	0x00008000	,	PATTERN	:	0x00008000	},
		PSET16		:	{	MASK	:	0x00010000	,	PATTERN	:	0x00010000	},
		PSET17		:	{	MASK	:	0x00020000	,	PATTERN	:	0x00020000	},
		PSET18		:	{	MASK	:	0x00040000	,	PATTERN	:	0x00040000	},
		PSET19		:	{	MASK	:	0x00080000	,	PATTERN	:	0x00080000	},
		PSET20		:	{	MASK	:	0x00100000	,	PATTERN	:	0x00100000	},
		PSET21		:	{	MASK	:	0x00200000	,	PATTERN	:	0x00200000	},
		PSET22		:	{	MASK	:	0x00400000	,	PATTERN	:	0x00400000	},
		PSET23		:	{	MASK	:	0x00800000	,	PATTERN	:	0x00800000	},
		PSET24		:	{	MASK	:	0x01000000	,	PATTERN	:	0x01000000	},
		PSET25		:	{	MASK	:	0x02000000	,	PATTERN	:	0x02000000	},
		PSET26		:	{	MASK	:	0x04000000	,	PATTERN	:	0x04000000	},
		PSET27		:	{	MASK	:	0x08000000	,	PATTERN	:	0x08000000	},
		PSET28		:	{	MASK	:	0x10000000	,	PATTERN	:	0x10000000	},
		PSET29		:	{	MASK	:	0x20000000	,	PATTERN	:	0x20000000	},
		PSET30		:	{	MASK	:	0x40000000	,	PATTERN	:	0x40000000	},
		PSET31		:	{	MASK	:	0x80000000	,	PATTERN	:	0x80000000	},

		RESET		:	{	MASK	:	0x8001		,	PATTERN	:	0x0000		},
		SET			:	{	MASK	:	0x8001		,	PATTERN	:	0x0001		},

		RESETALM	:	{	MASK	:	0x8002		,	PATTERN	:	0x0000		},
		SETALM		:	{	MASK	:	0x8002		,	PATTERN	:	0x0002		},

		SENSORMODE	:	{	MASK	:	0x8010		,	PATTERN	:	0x0010		},
		UPDATETIME	:	{	MASK	:	0x0400		,	PATTERN	:	0x0400		},
	};

/** ********************************************************* */
function vStatus(_value, _rel_op, _status_word) {
	let Value;
	let Mask;
	let Pattern;

	if (!(STATUSWORD[_value]))       { Value   = 0;} else { Value   = Number(_value);                           }
	if (!(STATUSWORD[_status_word])) { Mask    = 0;} else { Mask    = Number(STATUSWORD[_status_word].MASK);    }
	if (!(STATUSWORD[_status_word])) { Pattern = 0;} else { Pattern = Number(STATUSWORD[_status_word].PATTERN); }

	// В логическом контексте:
	// Число 0, пустая строка "", null и undefined, а также NaN являются false,
	// Остальные значения – true.
	//

	switch (_rel_op) {
	case '=' :	return ((_value & Mask) == Pattern);	break;
	case '<>':	return ((_value & Mask) != Pattern);	break;
	default  :	alert( 'vStatus - Error _rel_op' );	break;
	}

};

/**
 * shapelib - ANTLR parser
 * 
 * используется только 32 фигуры
 */
var shapeliblist = [ 'ARROW1', 'ARROW2', 'DFDBKR', 'DFDCONT', 'DMPRO', 'FAN',
		'HEATER', 'HORZPMP', 'MED71', 'VEK04', 'VLVSTM1', 'VLVSTM2',
		'arrow2left', 'arrow4down', 'arrow4left', 'arrow4righ', 'arrow4up',
		'barscale', 'dfda1', 'dfda2', 'dfda3', 'dfda4', 'dfdgen', 'dfdxfmr',
		'diapump', 'fwpmp', 'nvalve', 'oriface', 'pmpmtr', 'pumpfill3',
		'valve1', 'valve5' ];

var shapelib = {
	valve1 : {
/*		make : 'sPOLYGON(trgt,4,[0,0,248,248],[0,382,0,382],1,"SOLID","SOLID");',	*/
//		make : 'sPOLYGON(trgt,3,[0,0,124],[0,382,191],1,"SOLID","SOLID");sPOLYGON(trgt,3,[124,248,248],[191,0,382],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,3,[0,0,124],[0,382,191],1,"SOLID","SOLID");sPOLYGON(trgt,3,[124,248,248],[191,0,382],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	valve5 : {
/*		make : 'sPOLYGON(trgt,4,[0,0,275,275],[273,634,273,634],1,"SOLID","SOLID");sLINE(trgt,2,[136,136],[445,138],1,"SOLID");sPOLYGON(trgt,32,[34,37,41,44,49,57,66,74,84,92,102,110,119,125,129,137,146,154,162,169,175,181,190,200,205,211,215,222,224,227,230,233],[130,113,98,82,68,52,39,29,20,13,8,4,2,1,0,0,1,3,6,9,13,20,28,37,47,56,65,80,91,102,116,130],1,"SOLID","SOLID");',	*/
//		make : 'sPOLYGON(trgt,3,[0,0,136],[273,634,454],1,"SOLID","SOLID");sPOLYGON(trgt,3,[136,275,275],[454,273,634],1,"SOLID","SOLID");sLINE(trgt,2,[136,136],[445,138],1,"SOLID");sPOLYGON(trgt,32,[34,37,41,44,49,57,66,74,84,92,102,110,119,125,129,137,146,154,162,169,175,181,190,200,205,211,215,222,224,227,230,233],[130,113,98,82,68,52,39,29,20,13,8,4,2,1,0,0,1,3,6,9,13,20,28,37,47,56,65,80,91,102,116,130],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,3,[0,0,136],[273,634,454],1,"SOLID","SOLID");sPOLYGON(trgt,3,[136,275,275],[454,273,634],1,"SOLID","SOLID");sLINE(trgt,2,[136,136],[445,138],1,"SOLID");sPOLYGON(trgt,32,[34,37,41,44,49,57,66,74,84,92,102,110,119,125,129,137,146,154,162,169,175,181,190,200,205,211,215,222,224,227,230,233],[130,113,98,82,68,52,39,29,20,13,8,4,2,1,0,0,1,3,6,9,13,20,28,37,47,56,65,80,91,102,116,130],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	VLVSTM1 : {
//		make : 'sLINE(trgt,2,[99,99],[600,300],1,"SOLID");sRECTANGLE(trgt,0,0,198,300,1,"SOLID","UNFILLED");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sLINE(trgt,2,[99,99],[600,300],1,"SOLID");sRECTANGLE(trgt,0,0,198,300,1,"SOLID","UNFILLED");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	VLVSTM2 : {
//		make : 'sLINE(trgt,2,[99,99],[400,100],1,"SOLID");sPOLYGON(trgt,32,[0,3,7,10,15,23,32,40,50,58,68,76,85,91,95,103,112,120,128,135,141,147,156,166,171,177,181,188,190,193,196,199],[130,113,98,82,68,52,39,29,20,13,8,4,2,1,0,0,1,3,6,9,13,20,28,37,47,56,65,80,91,102,116,130],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sLINE(trgt,2,[99,99],[400,100],1,"SOLID");sPOLYGON(trgt,32,[0,3,7,10,15,23,32,40,50,58,68,76,85,91,95,103,112,120,128,135,141,147,156,166,171,177,181,188,190,193,196,199],[130,113,98,82,68,52,39,29,20,13,8,4,2,1,0,0,1,3,6,9,13,20,28,37,47,56,65,80,91,102,116,130],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// seqblok:{make:'sELLIPSE(trgt,4259,5522,4259,5522,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// seqactv:{make:'sELLIPSE(trgt,4259,5522,4259,5522,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// hedactv:{make:'sRECTANGLE(trgt,0,0,1271,822,3,"SOLID","UNFILLED");',x0:0,y0:0},
	// VLVSTM3:{make:'sLINE(trgt,2,[114,114],[671,213],1,"SOLID");sLINE(trgt,2,[18,219],[193,193],1,"SOLID");sRECTANGLE(trgt,0,0,228,374,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// CANVPMP:{make:'sRECTANGLE(trgt,748,258,110,282,1,"SOLID","VERT_SLASH");sRECTANGLE(trgt,63,262,110,282,1,"SOLID","VERT_SLASH");sLINE(trgt,2,[862,862],[184,627],1,"SOLID");sLINE(trgt,2,[58,58],[188,631],1,"SOLID");sLINE(trgt,2,[920,920],[184,627],1,"SOLID");sLINE(trgt,2,[0,0],[188,631],1,"SOLID");sELLIPSE(trgt,462,398,288,398,1,"SOLID","OUTLINE");',x0:0,y0:0},
	// valve:{make:'sPOLYGON(trgt,7,[0,0,0,481,0,0,0],[1794,1794,2990,2392,1794,1794,1794],1,"SOLID","SOLID");sPOLYGON(trgt,7,[962,962,962,480,962,962,962],[2990,2990,1794,2392,2990,2990,2990],1,"SOLID","SOLID");sLINE(trgt,4,[481,481,481,481],[2392,598,598,598],1,"SOLID");sARC(trgt,3,0,962,1196,180,-180,1,"SOLID","SOLID");',x0:0,y0:0},
	RARROW1 : {
//		make : 'sLINE(trgt,4,[0,632,474,474],[259,259,518,518],1,"SOLID");sLINE(trgt,2,[632,474],[259,0],1,"SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sLINE(trgt,4,[0,632,474,474],[259,259,518,518],1,"SOLID");sLINE(trgt,2,[632,474],[259,0],1,"SOLID");
			return trgt;
		},
		x0 : 47,
		y0 : 301
	},
	// ARROW0:{make:'sLINE(trgt,3,[0,426,426],[265,265,265],3,"SOLID");sPOLYGON(trgt,4,[289,442,289,289],[468,265,0,0],1,"SOLID","SOLID");',x0:0,y0:0},
	// arrow2:{make:'sLINE(trgt,3,[0,426,426],[0,0,0],3,"SOLID");',x0:0,y0:0},
	// valve2:{make:'sPOLYGON(trgt,4,[0,0,275,275],[411,772,411,772],1,"SOLID","SOLID");sLINE(trgt,2,[138,138],[585,329],1,"SOLID");sRECTANGLE(trgt,46,81,173,237,1,"SOLID","UNFILLED");sPOLYGON(trgt,32,[45,47,50,54,59,66,73,81,89,97,104,111,120,125,130,136,144,153,159,166,170,177,184,192,198,202,205,212,214,217,220,222],[74,62,58,48,37,32,22,16,13,8,4,3,1,0,0,0,0,2,4,5,8,13,15,19,26,34,37,43,52,59,63,74],1,"SOLID","SOLID");',x0:0,y0:0},
	// valve3:{make:'sPOLYGON(trgt,4,[0,0,278,278],[453,811,453,811],1,"SOLID","SOLID");sLINE(trgt,2,[139,139],[625,354],1,"SOLID");sRECTANGLE(trgt,32,0,212,327,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// valve4:{make:'sPOLYGON(trgt,4,[0,0,275,275],[273,634,273,634],1,"SOLID","SOLID");sLINE(trgt,2,[136,136],[445,138],1,"SOLID");sPOLYGON(trgt,32,[34,37,41,44,49,57,66,74,84,92,102,110,119,125,129,137,146,154,162,169,175,181,190,200,205,211,215,222,224,227,230,233],[130,113,98,82,68,52,39,29,20,13,8,4,2,1,0,0,1,3,6,9,13,20,28,37,47,56,65,80,91,102,116,130],1,"SOLID","SOLID");sPOLYGON(trgt,3,[54,226,140],[687,687,464],1,"SOLID","SOLID");',x0:0,y0:0},
	// heater:{make:'sELLIPSE(trgt,493,409,265,409,1,"SOLID","UNFILLED");sELLIPSE(trgt,495,2577,265,409,1,"SOLID","UNFILLED");sLINE(trgt,2,[978,699],[1092,661],1,"SOLID");sLINE(trgt,2,[695,976],[2315,1884],1,"SOLID");sLINE(trgt,2,[3,284],[1099,668],1,"SOLID");sLINE(trgt,2,[494,494],[818,2165],1,"SOLID");sLINE(trgt,2,[279,1],[2323,1892],1,"SOLID");sLINE(trgt,3,[978,978,978],[1094,1879,1879],1,"SOLID");sLINE(trgt,3,[0,0,0],[1102,1887,1887],1,"SOLID");',x0:0,y0:0},
	// pump1:{make:'sLINE(trgt,17,[581,533,495,477,444,416,400,395,394,394,403,426,461,495,530,556,579],[133,180,224,255,322,409,482,555,627,680,754,825,896,949,980,1004,1020],1,"SOLID");sRECTANGLE(trgt,585,129,665,895,1,"SOLID","UNFILLED");sLINE(trgt,3,[1136,1205,1205],[1028,1250,1250],1,"SOLID");sLINE(trgt,3,[709,641,641],[1028,1250,1250],1,"SOLID");sLINE(trgt,2,[1202,643],[1255,1255],1,"SOLID");sARC(trgt,964,118,469,917,77,-154,1,"SOLID","UNFILLED");sLINE(trgt,3,[396,174,174],[604,604,604],5,"SOLID");sLINE(trgt,2,[174,174],[134,1076],1,"SOLID");sLINE(trgt,2,[1,1],[134,1076],1,"SOLID");sARC(trgt,0,930,176,272,6,-192,1,"SOLID","UNFILLED");sARC(trgt,1,0,176,272,353,192,1,"SOLID","UNFILLED");',x0:0,y0:0},
	oriface : {
//		make : 'sLINE(trgt,2,[0,0],[0,516],1,"SOLID");sLINE(trgt,2,[134,134],[110,408],1,"SOLID");sLINE(trgt,2,[269,269],[0,516],1,"SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sLINE(trgt,2,[0,0],[0,516],1,"SOLID");sLINE(trgt,2,[134,134],[110,408],1,"SOLID");sLINE(trgt,2,[269,269],[0,516],1,"SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// venturi:{make:'sLINE(trgt,2,[7,7],[6,520],1,"SOLID");sLINE(trgt,2,[513,513],[6,520],1,"SOLID");sARC(trgt,-277,-1559,1078,1664,241,56,1,"SOLID","UNFILLED");sARC(trgt,-279,425,1078,1664,61,56,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// sprayer:{make:'sRECTANGLE(trgt,0,1,542,964,1,"SOLID","UNFILLED");sLINE(trgt,3,[264,264,264],[0,481,481],1,"SOLID");sLINE(trgt,2,[265,398],[484,690],1,"SOLID");sLINE(trgt,2,[263,396],[481,275],1,"SOLID");sLINE(trgt,2,[267,400],[481,481],1,"SOLID");sLINE(trgt,2,[263,394],[481,388],1,"SOLID");sLINE(trgt,2,[265,396],[483,576],1,"SOLID");',x0:0,y0:0},
	// cooler:{make:'sELLIPSE(trgt,340,525,340,525,1,"SOLID","UNFILLED");sLINE(trgt,3,[2,103,103],[517,517,381],1,"SOLID");sLINE(trgt,3,[673,572,572],[525,525,661],1,"SOLID");sLINE(trgt,2,[105,572],[385,662],1,"SOLID");',x0:0,y0:0},
	ARROW1 : {
//		make : 'sPOLYGON(trgt,3,[92,184,0],[0,174,174],1,"SOLID","SOLID");sLINE(trgt,2,[94,94],[169,408],1,"SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,3,[92,184,0],[0,174,174],1,"SOLID","SOLID");sLINE(trgt,2,[94,94],[169,408],1,"SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	ARROW2 : {
//		make : 'sPOLYGON(trgt,3,[92,184,0],[0,174,174],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,3,[92,184,0],[0,174,174],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// halm:{make:'sLINE(trgt,5,[0,224,224,224,224],[0,0,253,0,0],1,"SOLID");',x0:0,y0:0},
	// hhalm:{make:'sLINE(trgt,5,[0,224,224,224,224],[0,0,253,0,0],1,"SOLID");sLINE(trgt,2,[121,121],[17,253],1,"SOLID");',x0:0,y0:0},
	HORZPMP : {
//		make : 'sLINE(trgt,2,[811,811],[0,539],1,"SOLID");sLINE(trgt,2,[753,753],[0,539],1,"SOLID");sPOLYGON(trgt,35,[753,269,211,163,124,92,48,22,3,0,3,3,26,55,70,94,141,188,244,279,323,388,422,454,483,510,532,554,574,593,620,642,650,650,753],[62,62,86,114,153,203,274,365,451,532,587,641,737,807,850,886,941,983,1009,1017,1030,1017,1002,983,963,938,908,882,847,807,741,648,548,444,444],1,"SOLID","SOLID");sARC(trgt,154,394,242,359,84,-169,1,"SOLID","OUTLINE");sARC(trgt,174,442,175,263,84,-169,1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sLINE(trgt,2,[811,811],[0,539],1,"SOLID");sLINE(trgt,2,[753,753],[0,539],1,"SOLID");sPOLYGON(trgt,35,[753,269,211,163,124,92,48,22,3,0,3,3,26,55,70,94,141,188,244,279,323,388,422,454,483,510,532,554,574,593,620,642,650,650,753],[62,62,86,114,153,203,274,365,451,532,587,641,737,807,850,886,941,983,1009,1017,1030,1017,1002,983,963,938,908,882,847,807,741,648,548,444,444],1,"SOLID","SOLID");sARC(trgt,154,394,242,359,84,-169,1,"SOLID","OUTLINE");sARC(trgt,174,442,175,263,84,-169,1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// lalm:{make:'sLINE(trgt,4,[230,0,0,0],[254,254,254,254],1,"SOLID");sLINE(trgt,3,[230,230,230],[229,127,0],1,"SOLID");',x0:0,y0:254},
	// llalm:{make:'sLINE(trgt,4,[118,118,118,118],[0,253,0,0],1,"SOLID");sLINE(trgt,4,[230,0,0,0],[258,258,258,258],1,"SOLID");sLINE(trgt,3,[230,230,230],[233,131,4],1,"SOLID");',x0:0,y0:254},
	// lllalm:{make:'sLINE(trgt,4,[3,3,3,3],[0,253,0,0],1,"SOLID");sLINE(trgt,4,[118,118,118,118],[0,253,0,0],1,"SOLID");sLINE(trgt,4,[230,0,0,0],[258,258,258,258],1,"SOLID");sLINE(trgt,3,[230,230,230],[233,131,4],1,"SOLID");',x0:0,y0:254},
	// ARROW3:{make:'sPOLYGON(trgt,3,[92,184,0],[0,174,174],1,"SOLID","SOLID");sLINE(trgt,3,[77,77,77],[169,408,408],1,"SOLID");',x0:0,y0:0},
	arrow4up : {
//		make : 'sPOLYGON(trgt,3,[0,85,171],[232,0,232],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,3,[0,85,171],[232,0,232],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	arrow4down : {
//		make : 'sPOLYGON(trgt,3,[164,82,0],[0,254,0],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,3,[164,82,0],[0,254,0],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	arrow4left : {
//		make : 'sPOLYGON(trgt,3,[164,0,164],[254,127,0],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,3,[164,0,164],[254,127,0],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	arrow4righ : {
//		make : 'sPOLYGON(trgt,3,[0,164,0],[0,127,254],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,3,[0,164,0],[0,127,254],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// valve6:{make:'sPOLYGON(trgt,4,[231,0,231,0],[0,0,432,432],1,"SOLID","SOLID");sLINE(trgt,2,[120,293],[216,217],1,"SOLID");sRECTANGLE(trgt,313,51,211,329,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// arrow2down:{make:'sPOLYGON(trgt,4,[0,72,98,172],[0,181,181,0],1,"SOLID","SOLID");',x0:0,y0:0},
	arrow2left : {
//		make : 'sPOLYGON(trgt,4,[132,0,0,132],[0,102,152,254],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,4,[132,0,0,132],[0,102,152,254],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// arrow2righ:{make:'sPOLYGON(trgt,4,[0,132,132,0],[0,102,152,254],1,"SOLID","SOLID");',x0:0,y0:0},
	// sorhi:{make:'sLINE(trgt,2,[0,107],[0,0],1,"SOLID");sLINE(trgt,2,[50,50],[0,231],1,"SOLID");',x0:0,y0:0},
	// sorlow:{make:'sLINE(trgt,2,[0,107],[231,231],1,"SOLID");sLINE(trgt,2,[50,50],[231,0],1,"SOLID");',x0:0,y0:0},
	// sorav:{make:'sLINE(trgt,2,[0,107],[89,89],1,"SOLID");sLINE(trgt,2,[54,54],[183,0],1,"SOLID");',x0:54,y0:71},
	// FISHVLV:{make:'sRECTANGLE(trgt,0,0,4669,12190,1,"SOLID","UNFILLED");',x0:198,y0:677},
	// VALVE6:{make:'sLINE(trgt,2,[200,200],[441,188],1,"SOLID");sPOLYGON(trgt,4,[0,400,400,0],[254,628,254,628],1,"SOLID","UNFILLED");sARC(trgt,-6,0,421,589,158,-137,1,"SOLID","UNFILLED");sLINE(trgt,2,[8,400],[188,188],1,"SOLID");',x0:203,y0:440},
	// VALBACTD:{make:'sRECTANGLE(trgt,0,0,228,27,1,"SOLID","SOLID");sLINE(trgt,2,[114,114],[27,1323],1,"SOLID");',x0:0,y0:0},
	// dummy:{make:'sELLIPSE(trgt,546,637,546,637,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// fillvalve:{make:'sPOLYGON(trgt,5,[0,0,1056,1056,0],[0,1368,0,1368,0],1,"SOLID","SOLID");',x0:533,y0:687},
	// arrow1:{make:'sPOLYGON(trgt,6,[266,266,0,266,531,266],[558,240,240,0,240,240],1,"SOLID","UNFILLED");',x0:265,y0:555},
	// FILTER:{make:'sLINE(trgt,9,[0,105,230,422,614,808,986,1108,1231],[163,163,0,257,0,257,23,187,187],4,"SOLID");',x0:0,y0:0},
	// arrow1fill:{make:'sPOLYGON(trgt,6,[266,266,0,266,531,266],[558,240,240,0,240,240],1,"SOLID","SOLID");sRECTANGLE(trgt,246,242,40,318,1,"SOLID","SOLID");',x0:250,y0:529},
	// arrow2fill:{make:'sPOLYGON(trgt,4,[0,310,619,0],[505,0,505,505],1,"SOLID","SOLID");',x0:328,y0:472},
	// fillvalve2:{make:'sPOLYGON(trgt,5,[0,0,451,451,0],[0,505,0,505,0],1,"SOLID","SOLID");',x0:228,y0:249},
	nvalve : {
//		make : 'sLINE(trgt,4,[1056,1056,0,0],[0,1216,0,1216],2,"SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sLINE(trgt,4,[1056,1056,0,0],[0,1216,0,1216],2,"SOLID");
			return trgt;
		},
		x0 : 517,
		y0 : 587
	},
	nvalve1 : {
//		make : 'sLINE(trgt,4,[419,419,0,0],[0,456,0,456],2,"SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sLINE(trgt,4,[419,419,0,0],[0,456,0,456],2,"SOLID");
			return trgt;
		},
		x0 : 207,
		y0 : 223
	},
	// valvetop:{make:'sARC(trgt,-4,0,303,482,161,-143,2,"SOLID","SOLID");sLINE(trgt,2,[0,288],[150,150],2,"SOLID");sLINE(trgt,2,[144,123],[658,152],3,"SOLID");',x0:127,y0:533},
	// valvetop1:{make:'sARC(trgt,-4,0,303,482,161,-143,2,"SOLID","SOLID");sLINE(trgt,2,[0,288],[150,150],2,"SOLID");sLINE(trgt,2,[143,139],[585,178],3,"SOLID");',x0:127,y0:533},
	// tiebreaker:{make:'sLINE(trgt,2,[379,379],[261,759],2,"SOLID");sLINE(trgt,2,[379,379],[2023,1526],2,"SOLID");sLINE(trgt,3,[282,379,476],[409,255,409],2,"SOLID");sLINE(trgt,3,[475,379,283],[1875,2028,1875],2,"SOLID");sLINE(trgt,3,[202,242,282],[1049,1301,1049],2,"SOLID");sELLIPSE(trgt,381,1142,381,606,2,"SOLID","UNFILLED");sARC(trgt,72,686,583,928,52,-105,2,"SOLID","UNFILLED");sLINE(trgt,3,[281,378,475],[154,0,154],2,"SOLID");sLINE(trgt,3,[281,378,475],[2136,2290,2136],2,"SOLID");',x0:377,y0:5},
	// tiebank:{make:'sARC(trgt,319,0,318,506,90,180,2,"SOLID","UNFILLED");sARC(trgt,-159,10,318,506,90,-180,2,"SOLID","UNFILLED");sARC(trgt,319,505,318,506,90,180,2,"SOLID","UNFILLED");sARC(trgt,-159,515,318,506,90,-180,2,"SOLID","UNFILLED");sARC(trgt,319,1012,318,506,90,180,2,"SOLID","UNFILLED");sARC(trgt,-159,1021,318,506,90,-180,2,"SOLID","UNFILLED");sARC(trgt,319,1518,318,506,90,180,2,"SOLID","UNFILLED");sARC(trgt,-159,1528,318,506,90,-180,2,"SOLID","UNFILLED");',x0:2,y0:1015},
	// tiebank1:{make:'sARC(trgt,468,-199,156,398,0,-180,1,"SOLID","UNFILLED");sARC(trgt,312,-199,156,398,0,-180,1,"SOLID","UNFILLED");sARC(trgt,156,-199,156,398,0,-180,1,"SOLID","UNFILLED");sARC(trgt,0,-199,156,398,0,-180,1,"SOLID","UNFILLED");',x0:280,y0:28},
	// vlvsol:{make:'sLINE(trgt,8,[0,0,304,608,608,304,0,0],[0,508,254,508,0,254,0,0],1,"SOLID");',x0:0,y0:0},
	// cb:{make:'sLINE(trgt,2,[98,98],[261,759],2,"SOLID");sLINE(trgt,2,[98,98],[2023,1526],2,"SOLID");sLINE(trgt,3,[1,98,195],[409,255,409],2,"SOLID");sLINE(trgt,3,[194,98,2],[1875,2028,1875],2,"SOLID");sARC(trgt,-209,686,583,928,52,-105,2,"SOLID","UNFILLED");sLINE(trgt,3,[0,97,194],[154,0,154],2,"SOLID");sLINE(trgt,3,[0,97,194],[2136,2290,2136],2,"SOLID");',x0:0,y0:0},
	// poke:{make:'sPOLYGON(trgt,4,[1,173,352,1],[0,449,0,0],1,"SOLID","SOLID");sLINE(trgt,2,[0,353],[1,3],2,"SOLID");sLINE(trgt,2,[0,173],[3,451],2,"SOLID");sLINE(trgt,2,[175,352],[448,3],2,"SOLID");',x0:0,y0:0},
	// breakerin:{make:'sLINE(trgt,2,[98,98],[0,498],2,"SOLID");sLINE(trgt,2,[98,98],[3363,2841],2,"SOLID");sLINE(trgt,3,[0,97,194],[682,528,682],2,"SOLID");sLINE(trgt,3,[0,97,194],[2664,2818,2664],2,"SOLID");',x0:0,y0:1},
	// breakerout:{make:'sLINE(trgt,3,[0,97,194],[154,0,154],2,"SOLID");sLINE(trgt,3,[0,97,194],[3119,3273,3119],2,"SOLID");',x0:0,y0:0},
	// breaker:{make:'sLINE(trgt,2,[379,379],[6,504],2,"SOLID");sLINE(trgt,2,[379,379],[1768,1271],2,"SOLID");sLINE(trgt,3,[282,379,476],[154,0,154],2,"SOLID");sLINE(trgt,3,[475,379,283],[1620,1773,1620],2,"SOLID");sELLIPSE(trgt,381,887,381,606,2,"SOLID","UNFILLED");sARC(trgt,72,431,583,928,52,-105,2,"SOLID","UNFILLED");sLINE(trgt,3,[211,251,291],[761,1013,761],2,"SOLID");',x0:0,y0:0},
	// cb1:{make:'sLINE(trgt,2,[97,97],[6,504],2,"SOLID");sLINE(trgt,2,[97,97],[1768,1271],2,"SOLID");sLINE(trgt,3,[0,97,194],[154,0,154],2,"SOLID");sLINE(trgt,3,[193,97,1],[1620,1773,1620],2,"SOLID");sARC(trgt,-210,431,583,928,52,-105,2,"SOLID","UNFILLED");',x0:0,y0:0},
	// arrows:{make:'sPOLYGON(trgt,4,[0,149,297,0],[723,248,723,723],1,"SOLID","SOLID");sPOLYGON(trgt,4,[458,160,458,458],[476,237,0,476],1,"SOLID","SOLID");',x0:142,y0:218},
	// blkvlv:{make:'sPOLYGON(trgt,6,[179,179,368,368,197,197],[479,0,0,149,149,479],1,"SOLID","SOLID");sPOLYGON(trgt,5,[0,0,377,377,0],[249,697,249,697,249],1,"SOLID","SOLID");',x0:197,y0:464},
	// VERTPMP:{make:'sRECTANGLE(trgt,0,0,250,375,2,"SOLID","UNFILLED");sLINE(trgt,2,[117,117],[398,1498],2,"SOLID");sLINE(trgt,2,[204,31],[1508,1508],2,"SOLID");sLINE(trgt,2,[235,141],[865,865],2,"SOLID");sLINE(trgt,2,[297,297],[702,1030],2,"SOLID");sLINE(trgt,2,[250,250],[702,1030],2,"SOLID");',x0:0,y0:0},
	DMPRO : {
//		make : 'sRECTANGLE(trgt,0,0,218,775,2,"SOLID","UNFILLED");sLINE(trgt,2,[109,109],[5,774],1,"SOLID");sLINE(trgt,2,[176,43],[79,79],1,"SOLID");sLINE(trgt,2,[176,43],[202,202],1,"SOLID");sLINE(trgt,2,[176,43],[325,325],1,"SOLID");sLINE(trgt,2,[175,42],[448,448],1,"SOLID");sLINE(trgt,2,[176,43],[571,571],1,"SOLID");sLINE(trgt,2,[176,43],[694,694],1,"SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sRECTANGLE(trgt,0,0,218,775,2,"SOLID","UNFILLED");sLINE(trgt,2,[109,109],[5,774],1,"SOLID");sLINE(trgt,2,[176,43],[79,79],1,"SOLID");sLINE(trgt,2,[176,43],[202,202],1,"SOLID");sLINE(trgt,2,[176,43],[325,325],1,"SOLID");sLINE(trgt,2,[175,42],[448,448],1,"SOLID");sLINE(trgt,2,[176,43],[571,571],1,"SOLID");sLINE(trgt,2,[176,43],[694,694],1,"SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// TFILL:{make:'sPOLYGON(trgt,8,[0,497,497,294,294,202,202,0],[0,0,145,145,724,724,145,145],1,"SOLID","SOLID");',x0:0,y0:0},
	// TUNFILL:{make:'sPOLYGON(trgt,8,[0,497,497,295,295,203,203,0],[0,0,145,145,724,724,145,145],1,"SOLID","UNFILLED");',x0:262,y0:119},
	// DMPRC:{make:'sRECTANGLE(trgt,0,0,218,775,2,"SOLID","UNFILLED");sLINE(trgt,2,[99,99],[17,774],1,"SOLID");sLINE(trgt,2,[165,32],[51,156],1,"SOLID");sLINE(trgt,2,[165,32],[157,279],1,"SOLID");sLINE(trgt,2,[165,32],[280,386],1,"SOLID");sLINE(trgt,2,[165,32],[387,506],1,"SOLID");sLINE(trgt,2,[165,32],[506,612],1,"SOLID");sLINE(trgt,2,[165,32],[613,719],1,"SOLID");',x0:0,y0:0},
	// nrvlv:{make:'sLINE(trgt,4,[65,65,352,352],[157,0,0,151],2,"SOLID");sPOLYGON(trgt,8,[194,194,131,131,279,279,215,215],[526,150,151,93,93,150,151,529],1,"SOLID","SOLID");sLINE(trgt,4,[359,359,0,0],[307,714,307,714],2,"SOLID");sPOLYGON(trgt,6,[19,228,228,387,228,228],[894,894,795,894,992,894],1,"SOLID","SOLID");sRECTANGLE(trgt,18,887,208,15,1,"SOLID","SOLID");',x0:0,y0:0},
	// blkchk:{make:'sLINE(trgt,4,[363,363,0,0],[286,699,286,699],2,"SOLID");sPOLYGON(trgt,6,[3,215,215,375,215,215],[881,881,781,881,980,881],1,"SOLID","SOLID");sRECTANGLE(trgt,2,874,211,15,1,"SOLID","SOLID");sPOLYGON(trgt,6,[176,176,365,365,194,194],[479,0,0,149,149,479],1,"SOLID","SOLID");',x0:191,y0:483},
	// erv:{make:'sARC(trgt,0,404,207,330,48,140,2,"SOLID","UNFILLED");sARC(trgt,111,49,271,431,243,120,2,"SOLID","UNFILLED");sPOLYGON(trgt,7,[318,31,175,31,318,175,318],[888,888,431,0,0,431,888],1,"SOLID","SOLID");',x0:175,y0:429},
	// BYPASS:{make:'sPOLYGON(trgt,4,[0,0,278,0],[262,715,489,262],1,"SOLID","SOLID");sPOLYGON(trgt,4,[278,138,415,278],[489,944,944,489],1,"SOLID","SOLID");sARC(trgt,76,0,414,541,161,-143,2,"SOLID","SOLID");sLINE(trgt,2,[288,288],[571,178],3,"SOLID");',x0:282,y0:527},
	// vlv1:{make:'sPOLYGON(trgt,7,[0,0,360,720,720,360,0],[323,915,619,915,323,619,323],1,"SOLID","SOLID");sRECTANGLE(trgt,185,237,353,381,1,"SOLID","SOLID");sPOLYGON(trgt,8,[354,354,250,250,494,494,388,388],[256,34,34,0,0,34,34,258],1,"SOLID","SOLID");',x0:350,y0:552},
	// regvlv:{make:'sARC(trgt,40,229,556,844,161,-143,2,"SOLID","SOLID");sLINE(trgt,4,[332,332,812,428],[304,0,0,1064],2,"SOLID");sLINE(trgt,2,[327,327],[1120,506],3,"SOLID");sPOLYGON(trgt,5,[617,617,0,0,617],[1344,770,1344,770,1344],1,"SOLID","SOLID");',x0:310,y0:972},
	// vlv3:{make:'sARC(trgt,3,0,473,627,19,143,2,"SOLID","SOLID");sLINE(trgt,2,[241,241],[191,560],3,"SOLID");sPOLYGON(trgt,3,[241,128,354],[531,883,883],1,"SOLID","SOLID");sPOLYGON(trgt,5,[0,0,484,484,0],[741,316,741,316,741],1,"SOLID","SOLID");',x0:259,y0:524},
	// airfan:{make:'sPOLYGON(trgt,7,[358,977,977,698,631,549,439],[0,4,417,417,212,90,27],2,"SOLID","SOLID");sARC(trgt,345,239,425,629,186,-98,1,"SOLID","SOLID");sARC(trgt,116,571,425,629,186,-98,1,"SOLID","SOLID");sARC(trgt,125,-54,425,631,6,-98,1,"SOLID","SOLID");sARC(trgt,-106,278,425,631,6,-98,1,"SOLID","SOLID");sELLIPSE(trgt,351,549,351,549,2,"SOLID","UNFILLED");',x0:335,y0:587},
	pumpfill3 : {
//		make : 'sPOLYGON(trgt,35,[497,172,135,104,79,59,31,14,2,0,2,2,17,35,45,60,90,120,156,178,207,248,270,290,309,326,340,354,367,379,396,410,415,415,496],[0,0,15,33,58,90,136,194,249,301,337,372,433,478,506,529,564,591,608,613,621,613,603,591,578,562,543,526,504,478,436,376,312,245,245],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,35,[497,172,135,104,79,59,31,14,2,0,2,2,17,35,45,60,90,120,156,178,207,248,270,290,309,326,340,354,367,379,396,410,415,415,496],[0,0,15,33,58,90,136,194,249,301,337,372,433,478,506,529,564,591,608,613,621,613,603,591,578,562,543,526,504,478,436,376,312,245,245],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 202,
		y0 : 306
	},
	// pump3:{make:'sPOLYGON(trgt,35,[539,186,147,113,86,64,34,14,2,0,2,2,18,38,50,65,97,129,170,193,223,269,292,314,335,354,368,384,397,412,429,445,450,450,539],[0,0,16,38,65,99,150,215,275,334,373,412,478,529,560,586,624,654,673,679,687,679,668,654,639,621,602,582,558,529,482,416,345,301,301],1,"SOLID","UNFILLED");',x0:202,y0:306},
	// valvetop3:{make:'sARC(trgt,-4,0,303,482,161,-143,2,"SOLID","SOLID");sLINE(trgt,2,[0,288],[150,150],2,"SOLID");sLINE(trgt,2,[127,127],[533,77],3,"SOLID");',x0:118,y0:490},
	// fan:{make:'sRECTANGLE(trgt,0,0,358,1176,2,"SOLID","UNFILLED");sPOLYGON(trgt,4,[43,290,43,290],[270,270,846,846],1,"SOLID","SOLID");sARC(trgt,41,51,251,418,189,-198,1,"SOLID","SOLID");sARC(trgt,41,661,251,462,170,198,1,"SOLID","SOLID");',x0:159,y0:579},
	// chkvlv:{make:'sLINE(trgt,4,[363,363,0,0],[0,413,0,413],2,"SOLID");sPOLYGON(trgt,6,[3,215,215,375,215,215],[595,595,495,595,694,595],1,"SOLID","SOLID");sRECTANGLE(trgt,2,588,211,15,1,"SOLID","SOLID");',x0:176,y0:193},
	// VLVCLOSED:{make:'sRECTANGLE(trgt,0,0,276,886,2,"SOLID","UNFILLED");sELLIPSE(trgt,137,430,91,128,1,"SOLID","SOLID");sLINE(trgt,2,[141,141],[20,861],2,"SOLID");',x0:134,y0:401},
	// VLVOPEN:{make:'sRECTANGLE(trgt,0,0,276,886,2,"SOLID","UNFILLED");sELLIPSE(trgt,140,419,91,128,1,"SOLID","SOLID");sLINE(trgt,2,[8,266],[5,881],2,"SOLID");',x0:0,y0:0},
	// VENTVLV:{make:'sARC(trgt,6,0,623,844,161,-143,2,"SOLID","SOLID");sLINE(trgt,2,[327,327],[891,277],3,"SOLID");sPOLYGON(trgt,5,[617,617,0,0,617],[1115,541,1115,541,1115],1,"SOLID","SOLID");',x0:310,y0:768},
	// vlv:{make:'sPOLYGON(trgt,7,[0,0,360,720,720,360,0],[0,592,296,592,0,296,0],1,"SOLID","SOLID");',x0:0,y0:0},
	// vlvplug:{make:'sPOLYGON(trgt,7,[0,0,360,720,720,360,0],[296,888,592,888,296,592,296],1,"SOLID","SOLID");sLINE(trgt,2,[360,360],[592,0],1,"SOLID");sELLIPSE(trgt,355,618,108,177,1,"SOLID","SOLID");',x0:0,y0:0},
	// vlsafety:{make:'sLINE(trgt,7,[576,252,576,252,576,360,360],[0,166,332,498,664,830,830],1,"SOLID");sPOLYGON(trgt,4,[0,0,360,0],[532,1124,828,532],1,"SOLID","SOLID");sPOLYGON(trgt,4,[360,180,540,360],[828,1420,1420,828],1,"SOLID","SOLID");',x0:0,y0:0},
	// vlvdiaph:{make:'sPOLYGON(trgt,7,[0,0,360,720,720,360,0],[296,888,592,888,296,592,296],1,"SOLID","SOLID");sELLIPSE(trgt,355,618,108,177,1,"SOLID","SOLID");sLINE(trgt,2,[180,540],[295,295],1,"SOLID");sARC(trgt,180,0,360,591,180,-180,1,"SOLID","SOLID");sLINE(trgt,2,[360,360],[592,296],2,"SOLID");',x0:0,y0:0},
	// vlvmotor:{make:'sLINE(trgt,3,[360,360,360],[0,888,888],1,"SOLID");sPOLYGON(trgt,5,[360,0,0,360,360],[0,0,296,296,296],1,"SOLID","SOLID");sPOLYGON(trgt,4,[720,720,360,720],[592,1184,888,592],1,"SOLID","SOLID");sPOLYGON(trgt,4,[360,540,180,360],[888,1480,1480,888],1,"SOLID","SOLID");',x0:0,y0:0},
	// vlvglobe:{make:'sPOLYGON(trgt,7,[0,0,360,720,720,360,0],[0,592,296,592,0,296,0],1,"SOLID","SOLID");sELLIPSE(trgt,355,322,108,177,1,"SOLID","SOLID");',x0:0,y0:0},
	// pumpposdsp:{make:'sLINE(trgt,3,[0,0,0],[0,1184,1184],1,"SOLID");sLINE(trgt,3,[0,900,900],[1184,1184,592],1,"SOLID");sLINE(trgt,2,[0,360],[0,0],1,"SOLID");sLINE(trgt,2,[360,360],[0,592],1,"SOLID");sLINE(trgt,2,[360,900],[592,592],1,"SOLID");sARC(trgt,47,83,252,414,135,-270,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// VLVSOLV:{make:'sLINE(trgt,7,[576,252,576,252,576,360,360],[0,166,332,498,664,830,830],1,"SOLID");sPOLYGON(trgt,4,[0,0,360,0],[532,1124,828,532],1,"SOLID","SOLID");sPOLYGON(trgt,4,[360,180,540,360],[828,1420,1420,828],1,"SOLID","SOLID");',x0:0,y0:0},
	// SOLVLV:{make:'sLINE(trgt,7,[576,252,576,252,576,360,360],[0,166,332,498,664,830,830],1,"SOLID");sPOLYGON(trgt,4,[0,0,360,0],[532,1124,828,532],1,"SOLID","SOLID");sPOLYGON(trgt,4,[360,180,540,360],[828,1420,1420,828],1,"SOLID","SOLID");',x0:0,y0:0},
	// acb:{make:'sLINE(trgt,2,[0,0],[0,498],2,"SOLID");sLINE(trgt,2,[0,0],[1762,1265],2,"SOLID");sARC(trgt,-307,425,583,928,52,-105,2,"SOLID","UNFILLED");',x0:0,y0:0},
	// cuebox:{make:'sRECTANGLE(trgt,0,0,243,607,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// dyn25c:{make:'sELLIPSE(trgt,192,311,192,311,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// dyn25o:{make:'sELLIPSE(trgt,192,311,192,311,1,"SOLID","SOLID");',x0:0,y0:0},
	// dyn25i:{make:'sELLIPSE(trgt,192,311,192,311,1,"SOLID","UNFILLED");sPOLYGON(trgt,3,[127,190,237],[34,257,31],1,"SOLID","SOLID");sPOLYGON(trgt,3,[122,206,261],[586,383,589],1,"SOLID","SOLID");sPOLYGON(trgt,3,[56,142,4],[84,258,258],1,"SOLID","SOLID");sPOLYGON(trgt,3,[68,147,8],[531,364,364],1,"SOLID","SOLID");sPOLYGON(trgt,3,[309,242,369],[84,258,258],1,"SOLID","SOLID");sPOLYGON(trgt,3,[321,246,373],[504,364,364],1,"SOLID","SOLID");',x0:0,y0:0},
	// vlv9xxxx:{make:'sLINE(trgt,5,[0,0,384,384,0],[0,288,0,288,0],1,"SOLID");',x0:0,y0:0},
	orifaceplt : {
//		make : 'sLINE(trgt,2,[174,0],[144,144],2,"SOLID");sLINE(trgt,2,[570,396],[144,144],2,"SOLID");sLINE(trgt,6,[570,426,144,0,144,426],[144,0,0,144,288,288],1,"SOLID");sLINE(trgt,2,[426,570],[288,144],1,"SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sLINE(trgt,2,[174,0],[144,144],2,"SOLID");sLINE(trgt,2,[570,396],[144,144],2,"SOLID");sLINE(trgt,6,[570,426,144,0,144,426],[144,0,0,144,288,288],1,"SOLID");sLINE(trgt,2,[426,570],[288,144],1,"SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// cross:{make:'sLINE(trgt,2,[36,36],[0,132],1,"SOLID");sLINE(trgt,2,[0,71],[71,71],1,"SOLID");',x0:0,y0:0},
	// minus:{make:'sLINE(trgt,2,[0,70],[0,0],1,"SOLID");',x0:0,y0:0},
	// circlecap:{make:'sLINE(trgt,4,[310,166,166,310],[0,0,72,72],1,"SOLID");sLINE(trgt,4,[310,166,166,310],[892,892,964,964],1,"SOLID");sLINE(trgt,2,[310,310],[72,0],1,"SOLID");sLINE(trgt,2,[310,310],[964,892],1,"SOLID");sELLIPSE(trgt,241,480,241,411,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// planpump:{make:'sLINE(trgt,2,[7,142],[1238,1012],1,"SOLID");sLINE(trgt,2,[673,538],[1238,1012],1,"SOLID");sLINE(trgt,2,[7,673],[1238,1238],1,"SOLID");sARC(trgt,0,0,686,1114,234,-289,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// plnpump2:{make:'sLINE(trgt,2,[4,82],[709,580],1,"SOLID");sLINE(trgt,2,[392,313],[709,580],1,"SOLID");sLINE(trgt,2,[4,392],[709,709],1,"SOLID");sARC(trgt,0,0,399,638,234,-289,1,"SOLID","UNFILLED");',x0:0,y0:0},
	// tinycircle:{make:'sELLIPSE(trgt,60,97,60,97,1,"SOLID","SOLID");',x0:0,y0:0},
	// dyn01c:{make:'sPOLYGON(trgt,5,[99,99,476,476,99],[0,282,0,282,0],1,"SOLID","UNFILLED");sLINE(trgt,2,[0,0],[11,261],1,"SOLID");sLINE(trgt,2,[573,573],[11,261],1,"SOLID");',x0:0,y0:0},
	// dyn01p:{make:'sLINE(trgt,2,[0,573],[140,140],1,"SOLID");sLINE(trgt,5,[93,93,471,471,93],[0,282,0,282,0],1,"SOLID");sPOLYGON(trgt,4,[93,471,471,93],[0,282,141,141],1,"SOLID","SOLID");',x0:0,y0:0},
	// dyn01o:{make:'sPOLYGON(trgt,5,[99,99,476,476,99],[0,282,0,282,0],1,"SOLID","SOLID");sLINE(trgt,2,[0,573],[140,140],1,"SOLID");',x0:0,y0:0},
	// dyn01i:{make:'sPOLYGON(trgt,5,[99,99,476,476,99],[0,282,0,282,0],1,"SOLID","SOLID");sLINE(trgt,2,[0,0],[11,261],1,"SOLID");sLINE(trgt,2,[573,573],[11,261],1,"SOLID");',x0:0,y0:0},
	// dyn01c2:{make:'sPOLYGON(trgt,5,[99,99,476,476,99],[0,282,0,282,0],1,"SOLID","UNFILLED");sLINE(trgt,2,[0,0],[11,261],2,"SOLID");sLINE(trgt,2,[573,573],[11,261],2,"SOLID");',x0:0,y0:0},
	// dyn01p2:{make:'sLINE(trgt,2,[0,573],[140,140],2,"SOLID");sLINE(trgt,5,[93,93,471,471,93],[0,282,0,282,0],1,"SOLID");sPOLYGON(trgt,4,[93,471,471,93],[0,282,141,141],1,"SOLID","SOLID");',x0:0,y0:0},
	// dyn01o2:{make:'sPOLYGON(trgt,5,[99,99,476,476,99],[0,282,0,282,0],1,"SOLID","SOLID");sLINE(trgt,2,[0,573],[140,140],2,"SOLID");',x0:0,y0:0},
	// dyn01i2:{make:'sPOLYGON(trgt,5,[99,99,476,476,99],[0,282,0,282,0],1,"SOLID","SOLID");sLINE(trgt,2,[0,0],[11,261],2,"SOLID");sLINE(trgt,2,[573,573],[11,261],2,"SOLID");',x0:0,y0:0},
	// dyn06c:{make:'sLINE(trgt,5,[97,97,31,163,97],[426,240,168,72,0],1,"SOLID");sLINE(trgt,2,[472,472],[282,570],1,"SOLID");sLINE(trgt,2,[189,0],[1036,1036],1,"SOLID");sPOLYGON(trgt,6,[194,100,290,290,99,0],[714,429,572,287,426,714],1,"SOLID","UNFILLED");',x0:0,y0:0},
	// dyn06p:{make:'sLINE(trgt,6,[287,287,95,191,0,95],[283,571,427,715,715,427],1,"SOLID");sLINE(trgt,2,[95,287],[427,283],1,"SOLID");sPOLYGON(trgt,8,[95,189,96,287,287,95,95,95],[716,716,428,428,286,430,712,714],1,"SOLID","SOLID");sLINE(trgt,2,[472,293],[416,416],1,"SOLID");sLINE(trgt,2,[96,96],[1036,705],1,"SOLID");sLINE(trgt,5,[97,97,31,163,97],[426,240,168,72,0],1,"SOLID");',x0:0,y0:0},
	// dyn06o:{make:'sLINE(trgt,2,[472,293],[416,416],1,"SOLID");sLINE(trgt,2,[96,96],[1036,705],1,"SOLID");sLINE(trgt,5,[97,97,31,163,97],[426,240,168,72,0],1,"SOLID");sPOLYGON(trgt,6,[194,100,290,290,99,0],[714,429,572,287,426,714],1,"SOLID","SOLID");',x0:0,y0:0},
	// dyn06i:{make:'sLINE(trgt,5,[97,97,31,163,97],[426,240,168,72,0],1,"SOLID");sLINE(trgt,2,[472,472],[282,570],1,"SOLID");sLINE(trgt,2,[189,0],[1036,1036],1,"SOLID");sPOLYGON(trgt,6,[194,100,290,290,99,0],[714,429,572,287,426,714],1,"SOLID","SOLID");',x0:0,y0:0},
	barscale : {
//		make : 'sLINE(trgt,2,[92,92],[3613,0],1,"SOLID");sLINE(trgt,2,[31,151],[339,339],1,"SOLID");sLINE(trgt,2,[31,151],[686,686],1,"SOLID");sLINE(trgt,2,[31,151],[2147,2147],1,"SOLID");sLINE(trgt,2,[31,151],[1056,1056],1,"SOLID");sLINE(trgt,2,[31,151],[2517,2517],1,"SOLID");sLINE(trgt,2,[31,151],[2887,2887],1,"SOLID");sLINE(trgt,2,[31,151],[1425,1425],1,"SOLID");sLINE(trgt,2,[31,151],[3249,3249],1,"SOLID");sLINE(trgt,2,[0,190],[1793,1793],1,"SOLID");sLINE(trgt,2,[0,190],[0,0],1,"SOLID");sLINE(trgt,2,[0,190],[3613,3613],1,"SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sLINE(trgt,2,[92,92],[3613,0],1,"SOLID");sLINE(trgt,2,[31,151],[339,339],1,"SOLID");sLINE(trgt,2,[31,151],[686,686],1,"SOLID");sLINE(trgt,2,[31,151],[2147,2147],1,"SOLID");sLINE(trgt,2,[31,151],[1056,1056],1,"SOLID");sLINE(trgt,2,[31,151],[2517,2517],1,"SOLID");sLINE(trgt,2,[31,151],[2887,2887],1,"SOLID");sLINE(trgt,2,[31,151],[1425,1425],1,"SOLID");sLINE(trgt,2,[31,151],[3249,3249],1,"SOLID");sLINE(trgt,2,[0,190],[1793,1793],1,"SOLID");sLINE(trgt,2,[0,190],[0,0],1,"SOLID");sLINE(trgt,2,[0,190],[3613,3613],1,"SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// arrow01D:{make:'sPOLYGON(trgt,4,[1587,0,3174,1587],[0,1055,1055,0],2,"SOLID","UNFILLED");',x0:0,y0:0},
	// PUMP01F:{make:'sPOLYGON(trgt,5,[456,0,0,152,456],[6,6,438,438,6],1,"SOLID","SOLID");sARC(trgt,155,0,637,905,177,275,1,"SOLID","SOLID");',x0:0,y0:0},
	// test:{make:'sRECTANGLE(trgt,525,1459,1145,2528,1,"SOLID","UNFILLED");sRECTANGLE(trgt,1181,2722,1051,2384,1,"SOLID","UNFILLED");sRECTANGLE(trgt,0,0,1051,2480,1,"SOLID","UNFILLED");',x0:1360,y0:1994},
	DMPROL : {
//		make : 'sRECTANGLE(trgt,0,0,218,772,2,"SOLID","UNFILLED");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sRECTANGLE(trgt,0,0,218,772,2,"SOLID","UNFILLED");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// DMPRT:{make:'sLINE(trgt,2,[67,67],[0,708],1,"SOLID");sLINE(trgt,2,[133,0],[34,139],1,"SOLID");sLINE(trgt,2,[133,0],[140,261],1,"SOLID");sLINE(trgt,2,[133,0],[262,368],1,"SOLID");sLINE(trgt,2,[133,0],[369,488],1,"SOLID");sLINE(trgt,2,[133,0],[488,593],1,"SOLID");sLINE(trgt,2,[133,0],[594,700],1,"SOLID");',x0:0,y0:0},
	// VEK00:{make:'sPOLYGON(trgt,3,[61,122,0],[501,288,288],1,"SOLID","SOLID");sLINE(trgt,2,[62,62],[294,0],1,"SOLID");',x0:63,y0:478},
	VEK04 : {
//		make : 'sRECTANGLE(trgt,0,0,125,329,1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sRECTANGLE(trgt,0,0,125,329,1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 62,
		y0 : 164
	},
	// VEK05:{make:'sELLIPSE(trgt,104,156,104,156,1,"SOLID","UNFILLED");sLINE(trgt,2,[25,166],[38,250],1,"SOLID");sLINE(trgt,2,[166,25],[38,250],1,"SOLID");',x0:109,y0:23},
	// MED72:{make:'sLINE(trgt,2,[0,265],[414,17],1,"SOLID");sPOLYGON(trgt,3,[91,280,280],[0,274,0],1,"SOLID","SOLID");',x0:280,y0:18},
	// MED16:{make:'sPOLYGON(trgt,3,[225,112,0],[0,254,0],1,"SOLID","SOLID");',x0:114,y0:240},
	MED71 : {
//		make : 'sPOLYGON(trgt,35,[0,324,361,392,417,437,465,482,494,496,494,494,479,461,451,436,406,376,340,318,289,248,226,206,187,170,156,142,129,117,100,86,81,81,0],[0,0,15,33,58,90,136,194,249,301,337,372,433,478,506,529,564,591,608,613,621,613,603,591,578,562,543,526,504,478,436,376,312,245,245],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,35,[0,324,361,392,417,437,465,482,494,496,494,494,479,461,451,436,406,376,340,318,289,248,226,206,187,170,156,142,129,117,100,86,81,81,0],[0,0,15,33,58,90,136,194,249,301,337,372,433,478,506,529,564,591,608,613,621,613,603,591,578,562,543,526,504,478,436,376,312,245,245],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 14,
		y0 : 117
	},
	// SMLARROW:{make:'sPOLYGON(trgt,3,[76,153,0],[361,207,207],1,"SOLID","SOLID");sLINE(trgt,2,[78,78],[212,0],1,"SOLID");',x0:70,y0:337},
	// arrow4dwnf:{make:'sPOLYGON(trgt,3,[0,90,179],[0,254,0],1,"SOLID","OUTLINE");',x0:0,y0:0},
	arrow4upf : {
//		make : 'sPOLYGON(trgt,3,[0,92,185],[255,0,255],1,"SOLID","OUTLINE");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,3,[0,92,185],[255,0,255],1,"SOLID","OUTLINE");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	FAN : {
//		make : 'sELLIPSE(trgt,529,799,529,799,1,"SOLID","UNFILLED");sARC(trgt,462,137,606,804,220,101,1,"SOLID","UNFILLED");sARC(trgt,-6,648,606,804,140,-101,1,"SOLID","UNFILLED");sARC(trgt,524,414,663,995,166,91,1,"SOLID","UNFILLED");sARC(trgt,-119,173,663,995,346,91,1,"SOLID","UNFILLED");sARC(trgt,269,787,667,1001,102,91,1,"SOLID","UNFILLED");sARC(trgt,130,-192,667,1001,282,91,1,"SOLID","UNFILLED");sELLIPSE(trgt,532,800,70,105,1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sELLIPSE(trgt,529,799,529,799,1,"SOLID","UNFILLED");sARC(trgt,462,137,606,804,220,101,1,"SOLID","UNFILLED");sARC(trgt,-6,648,606,804,140,-101,1,"SOLID","UNFILLED");sARC(trgt,524,414,663,995,166,91,1,"SOLID","UNFILLED");sARC(trgt,-119,173,663,995,346,91,1,"SOLID","UNFILLED");sARC(trgt,269,787,667,1001,102,91,1,"SOLID","UNFILLED");sARC(trgt,130,-192,667,1001,282,91,1,"SOLID","UNFILLED");sELLIPSE(trgt,532,800,70,105,1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// MED11:{make:'sPOLYGON(trgt,4,[410,0,410,827],[0,215,433,215],1,"SOLID","SOLID");',x0:159,y0:233},
	// MOTOR:{make:'sLINE(trgt,17,[407,359,321,303,270,242,226,221,220,220,229,252,287,321,356,382,405],[4,51,95,126,193,280,353,426,498,551,625,696,767,820,851,875,891],1,"SOLID");sRECTANGLE(trgt,411,0,665,895,1,"SOLID","UNFILLED");sLINE(trgt,3,[962,1031,1031],[899,1121,1121],1,"SOLID");sLINE(trgt,3,[535,467,467],[899,1121,1121],1,"SOLID");sLINE(trgt,2,[1028,469],[1126,1126],1,"SOLID");sARC(trgt,790,-11,469,917,77,-154,1,"SOLID","UNFILLED");sLINE(trgt,3,[222,0,0],[475,475,475],5,"SOLID");',x0:0,y0:0},
	// chkvlv1:{make:'sLINE(trgt,2,[0,0],[98,440],2,"SOLID");sPOLYGON(trgt,3,[0,279,279],[263,116,421],1,"SOLID","SOLID");sARC(trgt,77,-59,122,199,24,-227,1,"SOLID","UNFILLED");',x0:127,y0:0},
	fwpmp : {
//		make : 'sPOLYGON(trgt,14,[1463,665,266,0,0,133,399,399,1463,1862,2128,2128,1862,1463],[0,0,400,400,800,800,1000,1200,1200,1000,1000,200,200,0],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,14,[1463,665,266,0,0,133,399,399,1463,1862,2128,2128,1862,1463],[0,0,400,400,800,800,1000,1200,1200,1000,1000,200,200,0],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 1062,
		y0 : 47
	},
	pmpmtr : {
//		make : 'sRECTANGLE(trgt,0,148,330,550,1,"SOLID","SOLID");sARC(trgt,-3,0,338,385,167,-154,1,"SOLID","SOLID");sARC(trgt,-4,462,338,385,193,154,1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sRECTANGLE(trgt,0,148,330,550,1,"SOLID","SOLID");sARC(trgt,-3,0,338,385,167,-154,1,"SOLID","SOLID");sARC(trgt,-4,462,338,385,193,154,1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	DFDBKR : {
//		make : 'sRECTANGLE(trgt,0,0,266,400,2,"SOLID","UNFILLED");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sRECTANGLE(trgt,0,0,266,400,2,"SOLID","UNFILLED");
			return trgt;
		},
		x0 : 138,
		y0 : 3
	},
	DFDCONT : {
//		make : 'sLINE(trgt,2,[0,266],[0,0],3,"SOLID");sLINE(trgt,2,[0,266],[200,200],3,"SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sLINE(trgt,2,[0,266],[0,0],3,"SOLID");sLINE(trgt,2,[0,266],[200,200],3,"SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	dfda1 : {
//		make : 'sPOLYGON(trgt,4,[99,0,198,99],[0,300,300,0],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,4,[99,0,198,99],[0,300,300,0],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 100,
		y0 : 0
	},
	dfda2 : {
//		make : 'sPOLYGON(trgt,4,[99,0,198,99],[300,0,0,300],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,4,[99,0,198,99],[300,0,0,300],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 99,
		y0 : 300
	},
	dfda3 : {
//		make : 'sPOLYGON(trgt,4,[0,165,165,0],[150,0,300,150],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,4,[0,165,165,0],[150,0,300,150],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 150
	},
	dfda4 : {
//		make : 'sPOLYGON(trgt,4,[165,0,0,165],[150,0,300,150],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,4,[165,0,0,165],[150,0,300,150],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 165,
		y0 : 150
	},
	dfdgen : {
//		make : 'sLINE(trgt,2,[265,265],[403,3],2,"SOLID");sLINE(trgt,2,[485,265],[623,403],2,"SOLID");sLINE(trgt,2,[46,265],[619,403],2,"SOLID");sELLIPSE(trgt,265,402,265,402,2,"SOLID","UNFILLED");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sLINE(trgt,2,[265,265],[403,3],2,"SOLID");sLINE(trgt,2,[485,265],[623,403],2,"SOLID");sLINE(trgt,2,[46,265],[619,403],2,"SOLID");sELLIPSE(trgt,265,402,265,402,2,"SOLID","UNFILLED");
			return trgt;
		},
		x0 : 265,
		y0 : 1
	},
	dfdxfmr : {
//		make : 'sARC(trgt,0,-157,265,398,180,180,2,"SOLID","UNFILLED");sARC(trgt,0,356,265,398,180,-180,2,"SOLID","UNFILLED");sARC(trgt,266,-157,265,398,180,180,2,"SOLID","UNFILLED");sARC(trgt,266,356,265,398,180,-180,2,"SOLID","UNFILLED");sARC(trgt,532,-157,265,398,180,180,2,"SOLID","UNFILLED");sARC(trgt,532,356,265,398,180,-180,2,"SOLID","UNFILLED");sARC(trgt,798,-157,265,398,180,180,2,"SOLID","UNFILLED");sARC(trgt,798,356,265,398,180,-180,2,"SOLID","UNFILLED");sLINE(trgt,2,[532,532],[0,50],2,"SOLID");sLINE(trgt,2,[532,532],[540,600],2,"SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sARC(trgt,0,-157,265,398,180,180,2,"SOLID","UNFILLED");sARC(trgt,0,356,265,398,180,-180,2,"SOLID","UNFILLED");sARC(trgt,266,-157,265,398,180,180,2,"SOLID","UNFILLED");sARC(trgt,266,356,265,398,180,-180,2,"SOLID","UNFILLED");sARC(trgt,532,-157,265,398,180,180,2,"SOLID","UNFILLED");sARC(trgt,532,356,265,398,180,-180,2,"SOLID","UNFILLED");sARC(trgt,798,-157,265,398,180,180,2,"SOLID","UNFILLED");sARC(trgt,798,356,265,398,180,-180,2,"SOLID","UNFILLED");sLINE(trgt,2,[532,532],[0,50],2,"SOLID");sLINE(trgt,2,[532,532],[540,600],2,"SOLID");
			return trgt;
		},
		x0 : 531,
		y0 : 3
	},
	// VALVE7:{make:'sPOLYGON(trgt,4,[0,0,264,264],[274,524,274,524],1,"SOLID","SOLID");sPOLYGON(trgt,4,[49,214,131,131],[601,601,401,401],1,"SOLID","SOLID");sLINE(trgt,2,[132,132],[400,100],1,"SOLID");sPOLYGON(trgt,32,[32,35,39,42,47,55,64,72,82,90,100,108,117,123,127,135,144,152,160,167,173,179,188,198,203,209,213,220,222,225,228,231],[130,113,98,82,68,52,39,29,20,13,8,4,2,1,0,0,1,3,6,9,13,20,28,37,47,56,65,80,91,102,116,130],1,"SOLID","SOLID");',x0:133,y0:401},
	// DFDCOIL:{make:'sARC(trgt,143,405,251,193,261,197,2,"SOLID","UNFILLED");sARC(trgt,144,809,251,193,261,197,2,"SOLID","UNFILLED");sARC(trgt,2,405,488,595,89,182,2,"SOLID","UNFILLED");sARC(trgt,3,809,488,595,89,182,2,"SOLID","UNFILLED");sARC(trgt,0,0,488,595,89,182,2,"SOLID","UNFILLED");',x0:0,y0:0},
	// stg:{make:'sPOLYGON(trgt,9,[0,600,900,1500,1500,900,600,0,0],[0,300,300,0,1100,800,800,1100,0],1,"SOLID","OUTLINE");',x0:0,y0:0},
	// horn:{make:'sPOLYGON(trgt,4,[526,23,23,526],[0,204,304,508],1,"SOLID","SOLID");sELLIPSE(trgt,42,262,42,63,1,"SOLID","OUTLINE");',x0:0,y0:0},
	diapump : {
//		make : 'sPOLYGON(trgt,12,[56,189,455,588,644,644,588,455,189,56,0,0],[414,621,621,414,414,207,207,0,0,207,207,414],1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,12,[56,189,455,588,644,644,588,455,189,56,0,0],[414,621,621,414,414,207,207,0,0,207,207,414],1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	HEATER : {
//		make : 'sRECTANGLE(trgt,0,0,666,458,1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sRECTANGLE(trgt,0,0,666,458,1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	// sigma:{make:'sLINE(trgt,2,[115,119],[0,0],2,"SOLID");sLINE(trgt,7,[117,117,0,80,0,116,116],[53,1,1,186,392,392,338],2,"SOLID");',x0:0,y0:0},
	// pt:{make:'sELLIPSE(trgt,276,396,276,396,1,"SOLID","UNFILLED");sLINE(trgt,4,[0,0,124,124],[384,10,384,384],2,"SOLID");sLINE(trgt,3,[128,128,128],[389,10,10],2,"SOLID");sELLIPSE(trgt,210,48,30,48,2,"SOLID","UNFILLED");sLINE(trgt,2,[184,246],[161,156],2,"SOLID");',x0:278,y0:400},
	test0 : {
//		make : 'sPOLYGON(trgt,4,[0,0,468,468],[332,660,332,660],1,"SOLID","SOLID");sPOLYGON(trgt,4,[0,0,468,468],[332,660,332,660],1,"SOLID","UNFILLED");sLINE(trgt,3,[234,234,234],[168,496,496],1,"SOLID");sARC(trgt,118,0,234,328,180,-180,1,"SOLID","SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,4,[0,0,468,468],[332,660,332,660],1,"SOLID","SOLID");sPOLYGON(trgt,4,[0,0,468,468],[332,660,332,660],1,"SOLID","UNFILLED");sLINE(trgt,3,[234,234,234],[168,496,496],1,"SOLID");sARC(trgt,118,0,234,328,180,-180,1,"SOLID","SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	},
	test1 : {
//		make : 'sPOLYGON(trgt,4,[0,310,619,0],[547,0,547,547],1,"SOLID","UNFILLED");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sPOLYGON(trgt,4,[0,310,619,0],[547,0,547,547],1,"SOLID","UNFILLED");
			return trgt;
		},
		x0 : 310,
		y0 : 546
	},
	CLOSEBTN : {
//		make : 'sRECTANGLE(trgt,0,0,218,722,1,"SOLID","UNFILLED");sLINE(trgt,2,[0,218],[0,772],3,"SOLID");sLINE(trgt,2,[0,218],[772,0],3,"SOLID");',
		make : function() {
			var trgt = new PIXI.Graphics();
			sRECTANGLE(trgt,0,0,218,722,1,"SOLID","UNFILLED");sLINE(trgt,2,[0,218],[0,772],3,"SOLID");sLINE(trgt,2,[0,218],[772,0],3,"SOLID");
			return trgt;
		},
		x0 : 0,
		y0 : 0
	}
};

/**
 * Графические заполняющие узоры являются монохромными.
 * Когда программа отображает заполняющий узор, установленные биты узора
 * отображаются активным цветом FG (переднего фона), а сброшенные биты
 * отображаются активным цветом BG (заднего фона).
 */
var FILLPATTERNSMATRIX = new PIXI.Matrix().scale(15,15);

var FILLPATTERNS = {
//unfilled    : {w : 24, h : 24, bits : [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]},
//solid       : {w : 24, h : 24, bits : [0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]},
//outline     : {w : 24, h : 24, bits : [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]},
aluminum    : {w : 32, h : 32, bits : [0x81,0x81,0x81,0x81,0x42,0x42,0x42,0x42,0x24,0x24,0x24,0x24,0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x24,0x24,0x24,0x24,0x42,0x42,0x42,0x42,0x81,0x81,0x81,0x81,0x81,0x81,0x81,0x81,0x42,0x42,0x42,0x42,0x24,0x24,0x24,0x24,0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x24,0x24,0x24,0x24,0x42,0x42,0x42,0x42,0x81,0x81,0x81,0x81,0x81,0x81,0x81,0x81,0x42,0x42,0x42,0x42,0x24,0x24,0x24,0x24,0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x24,0x24,0x24,0x24,0x42,0x42,0x42,0x42,0x81,0x81,0x81,0x81,0x81,0x81,0x81,0x81,0x42,0x42,0x42,0x42,0x24,0x24,0x24,0x24,0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x24,0x24,0x24,0x24,0x42,0x42,0x42,0x42,0x81,0x81,0x81,0x81]},
asterisks   : {w : 32, h : 32, bits : [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x04,0x41,0x82,0x20,0x08,0x21,0x84,0x10,0x10,0x11,0x88,0x08,0x20,0x09,0x90,0x04,0x40,0x05,0xa0,0x02,0x80,0x03,0xc0,0x01,0xfc,0x7f,0xfe,0x3f,0x80,0x03,0xc0,0x01,0x40,0x05,0xa0,0x02,0x20,0x09,0x90,0x04,0x10,0x11,0x88,0x08,0x08,0x21,0x84,0x10,0x04,0x41,0x82,0x20,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x04,0x41,0x82,0x20,0x08,0x21,0x84,0x10,0x10,0x11,0x88,0x08,0x20,0x09,0x90,0x04,0x40,0x05,0xa0,0x02,0x80,0x03,0xc0,0x01,0xfc,0x7f,0xfe,0x3f,0x80,0x03,0xc0,0x01,0x40,0x05,0xa0,0x02,0x20,0x09,0x90,0x04,0x10,0x11,0x88,0x08,0x08,0x21,0x84,0x10,0x04,0x41,0x82,0x20,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]},
back_slash  : {w : 32, h : 32, bits : [0x01,0x01,0x01,0x01,0x02,0x02,0x02,0x02,0x04,0x04,0x04,0x04,0x08,0x08,0x08,0x08,0x10,0x10,0x10,0x10,0x20,0x20,0x20,0x20,0x40,0x40,0x40,0x40,0x80,0x80,0x80,0x80,0x01,0x01,0x01,0x01,0x02,0x02,0x02,0x02,0x04,0x04,0x04,0x04,0x08,0x08,0x08,0x08,0x10,0x10,0x10,0x10,0x20,0x20,0x20,0x20,0x40,0x40,0x40,0x40,0x80,0x80,0x80,0x80,0x01,0x01,0x01,0x01,0x02,0x02,0x02,0x02,0x04,0x04,0x04,0x04,0x08,0x08,0x08,0x08,0x10,0x10,0x10,0x10,0x20,0x20,0x20,0x20,0x40,0x40,0x40,0x40,0x80,0x80,0x80,0x80,0x01,0x01,0x01,0x01,0x02,0x02,0x02,0x02,0x04,0x04,0x04,0x04,0x08,0x08,0x08,0x08,0x10,0x10,0x10,0x10,0x20,0x20,0x20,0x20,0x40,0x40,0x40,0x40,0x80,0x80,0x80,0x80]},
blocks      : {w : 32, h : 32, bits : [0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff]},
bricks      : {w : 32, h : 32, bits : [0xe0,0x83,0x0f,0x3e,0xe0,0x83,0x0f,0x3e,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xe0,0x83,0x0f,0x3e,0xe0,0x83,0x0f,0x3e,0xe0,0x83,0x0f,0x3e,0xe0,0x83,0x0f,0x3e,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xe0,0x83,0x0f,0x3e,0xe0,0x83,0x0f,0x3e,0xe0,0x83,0x0f,0x3e,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xe0,0x83,0x0f,0x3e,0xe0,0x83,0x0f,0x3e]},
bricks2     : {w : 32, h : 32, bits : [0xff,0xff,0xff,0xff,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0xff,0xff,0xff,0xff,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0xff,0xff,0xff,0xff,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0xff,0xff,0xff,0xff,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x10]},
bronze      : {w : 32, h : 32, bits : [0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x08,0x00,0x08,0x00,0x04,0x00,0x04,0x00,0x02,0x00,0x02,0x00,0x01,0x00,0x01,0x00,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x00,0x08,0x00,0x08,0x00,0x04,0x00,0x04,0x00,0x02,0x00,0x02,0x00,0x01,0x00,0x01,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x08,0x00,0x08,0x00,0x04,0x00,0x04,0x00,0x02,0x00,0x02,0x00,0x01,0x00,0x01,0x00,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x00,0x08,0x00,0x08,0x00,0x04,0x00,0x04,0x00,0x02,0x00,0x02,0x00,0x01,0x00,0x01]},
castiron    : {w : 32, h : 32, bits : [0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x02,0x02,0x02,0x02,0x01,0x01,0x01,0x01,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x02,0x02,0x02,0x02,0x01,0x01,0x01,0x01,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x02,0x02,0x02,0x02,0x01,0x01,0x01,0x01,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x02,0x02,0x02,0x02,0x01,0x01,0x01,0x01]},
slash       : {w : 32, h : 32, bits : [0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x02,0x02,0x02,0x02,0x01,0x01,0x01,0x01,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x02,0x02,0x02,0x02,0x01,0x01,0x01,0x01,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x02,0x02,0x02,0x02,0x01,0x01,0x01,0x01,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x20,0x20,0x20,0x10,0x10,0x10,0x10,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x02,0x02,0x02,0x02,0x01,0x01,0x01,0x01]},
ck_plate    : {w : 32, h : 32, bits : [0x01,0x08,0x01,0x08,0x02,0x04,0x02,0x04,0x04,0x02,0x04,0x02,0x08,0x01,0x08,0x01,0x10,0x00,0x10,0x00,0x20,0x00,0x20,0x00,0x40,0x00,0x40,0x00,0x80,0x00,0x80,0x00,0x08,0x01,0x08,0x01,0x04,0x02,0x04,0x02,0x02,0x04,0x02,0x04,0x01,0x08,0x01,0x08,0x00,0x80,0x00,0x80,0x00,0x40,0x00,0x40,0x00,0x20,0x00,0x20,0x00,0x10,0x00,0x10,0x01,0x08,0x01,0x08,0x02,0x04,0x02,0x04,0x04,0x02,0x04,0x02,0x08,0x01,0x08,0x01,0x10,0x00,0x10,0x00,0x20,0x00,0x20,0x00,0x40,0x00,0x40,0x00,0x80,0x00,0x80,0x00,0x08,0x01,0x08,0x01,0x04,0x02,0x04,0x02,0x02,0x04,0x02,0x04,0x01,0x08,0x01,0x08,0x00,0x80,0x00,0x80,0x00,0x40,0x00,0x40,0x00,0x20,0x00,0x20,0x00,0x10,0x00,0x10]},
concrete    : {w : 32, h : 32, bits : [0x08,0x84,0x01,0x00,0x08,0x04,0x9c,0x44,0xc2,0x70,0x22,0x04,0x70,0x80,0x22,0x30,0x24,0x04,0x22,0x10,0x80,0x00,0x1d,0x43,0x02,0x10,0x02,0x03,0x02,0x02,0x1c,0x01,0x40,0x48,0x14,0x30,0xca,0x08,0x1c,0x11,0x0a,0x14,0x00,0x40,0x00,0x00,0x60,0x01,0x40,0x00,0x01,0x04,0x86,0x33,0x06,0x08,0x80,0x12,0x89,0x40,0x86,0x43,0x09,0x60,0x09,0x00,0x26,0x00,0x09,0x06,0x00,0x04,0x86,0x46,0x90,0x25,0x80,0x00,0x4c,0x02,0x00,0x00,0x41,0x02,0x02,0x00,0xc0,0x81,0xc8,0x32,0x04,0x00,0x00,0x22,0x02,0xa0,0x08,0x03,0x00,0x80,0x1a,0x40,0x08,0x80,0xc2,0x01,0x40,0x08,0x40,0x82,0x04,0x00,0x44,0x82,0x80,0x46,0x80,0x99,0x00,0x46,0x20,0x68,0x2a,0x20,0x6a,0x04,0x08,0x00]},
dot         : {w : 24, h : 24, bits : [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x1c,0x00,0x00,0x1c,0x00,0x00,0x1c,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]},
earth       : {w : 32, h : 32, bits : [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x42,0x44,0x22,0x44,0x26,0x62,0x44,0x22,0x19,0x91,0x88,0x11,0x88,0x18,0x91,0x88,0x44,0x24,0x62,0x44,0x22,0x42,0x24,0x22,0x11,0x81,0x18,0x11,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x81,0x88,0x11,0x88,0x42,0x44,0x22,0x44,0x26,0x62,0x44,0x22,0x19,0x91,0x88,0x11,0x88,0x18,0x91,0x88,0x44,0x24,0x62,0x44,0x22,0x42,0x24,0x22,0x11,0x81,0x18,0x11]},
grating     : {w : 32, h : 32, bits : [0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xff,0xff,0xff,0xff,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xff,0xff,0xff,0xff,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xff,0xff,0xff,0xff,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xff,0xff,0xff,0xff,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xff,0xff,0xff,0xff,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xff,0xff,0xff,0xff,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xff,0xff,0xff,0xff,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xff,0xff,0xff,0xff]},
gravel      : {w : 32, h : 32, bits : [0x1c,0x00,0x00,0x0e,0x22,0x00,0x98,0x0a,0x41,0x20,0x00,0x0a,0x41,0x00,0x00,0x0e,0x41,0x80,0x00,0x00,0x22,0x80,0x00,0x00,0x1c,0x60,0x20,0x04,0x00,0x00,0x62,0x04,0x00,0x40,0x02,0x06,0x00,0x80,0x01,0x00,0x80,0x03,0x00,0x00,0x41,0x04,0x00,0x00,0x22,0x08,0x00,0x00,0x22,0x08,0x40,0x10,0x22,0x08,0xc0,0x20,0x40,0x04,0x80,0x03,0x80,0x03,0x00,0x02,0x00,0x00,0x06,0x00,0x00,0x00,0x03,0x40,0x00,0x80,0x00,0x40,0x88,0x00,0xc0,0x40,0x00,0xc1,0x20,0x41,0x00,0x22,0x21,0x01,0x20,0x24,0x21,0x01,0x10,0xc0,0xc0,0x00,0x10,0x00,0x00,0x00,0x90,0x00,0x04,0x00,0x10,0x01,0x04,0x07,0x70,0x10,0x84,0x08,0x80,0xc0,0x81,0x08,0x00,0x00,0x00,0x07,0x00,0x00,0x00,0x00]},
horz_strip  : {w : 32, h : 32, bits : [0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]},
horz_slash  : {w : 32, h : 32, bits : [0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]},
insulatn    : {w : 32, h : 32, bits : [0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x00,0x20,0x00,0x10,0x00,0x10,0x00,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x02,0x00,0x02,0x00,0x01,0x00,0x01,0x00,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x00,0x20,0x00,0x20,0x00,0x10,0x00,0x10,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x00,0x02,0x00,0x02,0x00,0x01,0x00,0x01,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x20,0x00,0x20,0x00,0x10,0x00,0x10,0x00,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x02,0x00,0x02,0x00,0x01,0x00,0x01,0x00,0x80,0x80,0x80,0x80,0x40,0x40,0x40,0x40,0x00,0x20,0x00,0x20,0x00,0x10,0x00,0x10,0x08,0x08,0x08,0x08,0x04,0x04,0x04,0x04,0x00,0x02,0x00,0x02,0x00,0x01,0x00,0x01]},
liquid      : {w : 32, h : 32, bits : [0xff,0xfb,0xdf,0x7f,0x00,0x00,0x00,0x00,0x33,0x33,0x33,0x33,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x3e,0x3f,0xbf,0xdf,0x00,0x00,0x00,0x00,0xe7,0x78,0xce,0x79,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x9f,0x8f,0xcf,0xe7,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xe7,0x78,0x3c,0xde,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xfe,0xfc,0xf1,0xe7,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xaf,0xe7,0xeb,0xf5,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xef,0x79,0xde,0xfb,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x7b,0x9e,0xe7,0x79,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]},
masonry     : {w : 32, h : 32, bits : [0x84,0x80,0x80,0x84,0x40,0x42,0x44,0x40,0x20,0x20,0x24,0x2c,0x12,0x11,0x10,0x10,0x08,0x08,0x89,0x48,0x04,0x04,0x04,0x84,0x02,0x12,0x52,0x02,0x11,0x21,0x01,0x11,0x86,0x80,0x80,0x80,0x40,0x40,0x44,0x42,0x24,0x20,0x24,0x20,0x10,0x11,0x10,0x10,0x48,0x08,0x48,0x48,0x04,0x04,0x04,0x44,0x02,0x32,0x42,0x02,0x21,0x01,0x21,0x01,0x80,0x90,0x80,0x80,0x4c,0x40,0x40,0x48,0x20,0xa0,0x20,0x24,0x12,0x10,0x12,0x50,0x48,0x89,0x48,0x48,0x84,0x84,0x44,0x04,0x02,0x02,0x02,0x42,0x01,0x09,0x19,0x21,0x80,0x84,0x80,0x80,0x42,0x44,0x40,0x42,0x24,0x20,0x22,0x20,0x90,0x10,0x11,0x10,0x08,0x88,0x08,0x09,0x44,0x04,0x04,0x04,0x42,0x22,0x12,0x02,0x11,0x01,0x41,0x01]},
plastic     : {w : 32, h : 32, bits : [0x80,0x81,0x81,0x81,0xc0,0xc0,0xc0,0xc0,0x60,0x60,0x60,0x60,0x30,0x30,0x30,0x30,0x18,0x18,0x18,0x18,0x0c,0x0c,0x0c,0x0c,0x06,0x06,0x06,0x06,0x03,0x03,0x03,0x03,0x81,0x81,0x81,0x81,0xc0,0xc0,0xc0,0xc0,0x60,0x60,0x60,0x60,0x30,0x30,0x30,0x30,0x18,0x18,0x18,0x18,0x0c,0x0c,0x0c,0x0c,0x06,0x06,0x06,0x06,0x03,0x03,0x03,0x03,0x81,0x81,0x81,0x81,0xc0,0xc0,0xc0,0xc0,0x60,0x60,0x60,0x60,0x30,0x30,0x30,0x30,0x18,0x18,0x18,0x18,0x0c,0x0c,0x0c,0x0c,0x06,0x06,0x06,0x06,0x03,0x03,0x03,0x03,0x81,0x81,0x81,0x81,0xc0,0xc0,0xc0,0xc0,0x60,0x60,0x60,0x60,0x30,0x30,0x30,0x30,0x18,0x18,0x18,0x18,0x0c,0x0c,0x0c,0x0c,0x06,0x06,0x06,0x06,0x03,0x03,0x03,0x03]},
ringhals    : {w : 61, h : 61, bits : [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xf0,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xf8,0xbf,0xff,0x07,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xe8,0x00,0xc0,0x1f,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xf8,0x00,0x80,0x3b,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xf8,0x01,0x80,0x3f,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xf8,0x00,0x00,0xfe,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x80,0xe8,0xfa,0x7f,0xba,0x00,0x00,0x00,0x00,0x00,0x00,0x40,0xbf,0xf8,0x00,0x00,0xfe,0xbe,0x00,0x00,0x00,0x00,0x00,0x3c,0x00,0xf8,0x00,0x00,0xfc,0x00,0x2e,0x00,0x00,0x00,0xd0,0x01,0x00,0xf8,0x01,0x00,0xf6,0x00,0x80,0x02,0x00,0x00,0x1c,0x00,0x00,0xf8,0x00,0x00,0x3e,0x00,0x00,0x18,0x00,0x00,0x03,0x00,0x00,0xd8,0x01,0x80,0x3f,0x00,0x00,0x60,0x00,0xc0,0x01,0x00,0x00,0xf8,0x00,0x80,0x3f,0x00,0x00,0x80,0x00,0xc0,0x00,0x00,0x00,0xf8,0x01,0xe0,0x0e,0x00,0x00,0xc0,0x03,0xa0,0x01,0x00,0x00,0xf8,0x40,0xff,0x03,0x00,0x00,0x80,0x02,0xc0,0x07,0x00,0x00,0xd8,0xc1,0x5f,0x00,0x00,0x00,0xf8,0x01,0x80,0x3a,0x00,0x00,0xf8,0xc0,0x0b,0x00,0x00,0x00,0x77,0x00,0x80,0xee,0x0b,0x00,0xf8,0x82,0x1f,0x00,0x00,0xf4,0x3d,0x00,0x00,0xb8,0xfd,0x0b,0x00,0x00,0x10,0x00,0xe8,0xbb,0x07,0x00,0x00,0x40,0xaf,0xfe,0xfd,0xb7,0xdf,0xff,0x7f,0xef,0x00,0x00,0x00,0x00,0xf0,0x6b,0x57,0xed,0xea,0xda,0xad,0x0b,0x00,0x00,0x00,0x00,0x00,0xfa,0xfd,0xbf,0x7f,0x77,0x2b,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x82,0xea,0xaa,0x09,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x78,0x00,0x00,0x02,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xf8,0x00,0xe0,0x07,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xf8,0x01,0xc0,0x1f,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xe8,0x00,0x80,0x3f,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xf8,0x01,0x80,0x3c,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xf8,0x00,0x00,0xf6,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xf8,0x01,0x00,0xfc,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xd8,0x00,0x00,0xf8,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xd6,0xe1,0x00,0x00,0x00,0x18,0x00,0x00,0x0a,0x00,0x00,0x00,0x06,0xe3,0x00,0x00,0x00,0x38,0x00,0x00,0x0c,0x00,0x00,0x00,0x06,0x02,0x00,0x00,0x00,0x18,0x00,0x00,0x0a,0x00,0x00,0x00,0x06,0xc3,0x98,0x0e,0xd4,0xd8,0x06,0x3e,0x0c,0x0d,0x00,0x00,0x04,0xe3,0x38,0x88,0x83,0x3c,0x14,0xa0,0xac,0x00,0x00,0x00,0xc6,0xc0,0x08,0xb8,0xc3,0x18,0x1c,0xe0,0x8a,0x01,0x00,0x00,0xe6,0xe1,0x18,0x98,0x82,0x18,0x1c,0xb4,0x8c,0x07,0x00,0x00,0x46,0xc1,0x18,0xa8,0xc3,0x3a,0x94,0xe3,0x0c,0x3c,0x00,0x00,0x02,0xe3,0x18,0xa8,0x83,0x18,0xdc,0xe1,0x0c,0x38,0x00,0x00,0x06,0xce,0x18,0x18,0xc7,0x18,0xd4,0xa1,0x0a,0x30,0x00,0x00,0x06,0xec,0x10,0x2a,0xd4,0x3a,0x1c,0xf7,0x8c,0x0e,0x00,0x00,0x00,0x00,0x00,0x00,0xc0,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xc0,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x3d,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xe0,0x4a,0x40,0x2a,0x25,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x20,0x55,0x70,0x41,0xd5,0x02,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]},
road        : {w : 32, h : 32, bits : [0x1c,0xc0,0x01,0x1c,0x22,0x20,0x02,0x22,0x41,0x10,0x04,0x41,0x41,0x10,0x04,0x41,0x41,0x10,0x04,0x41,0x22,0x20,0x02,0x22,0x1c,0xc0,0x01,0x1c,0x00,0x00,0x00,0x00,0x00,0x1c,0xc0,0x01,0x00,0x22,0x20,0x02,0x00,0x41,0x10,0x04,0x00,0x41,0x10,0x04,0x00,0x41,0x10,0x04,0x00,0x22,0x20,0x02,0x00,0x1c,0xc0,0x01,0x00,0x00,0x00,0x00,0x1c,0xc0,0x01,0x1c,0x22,0x20,0x02,0x22,0x41,0x10,0x04,0x41,0x41,0x10,0x04,0x41,0x41,0x10,0x04,0x41,0x22,0x20,0x02,0x22,0x1c,0xc0,0x01,0x1c,0x00,0x00,0x00,0x00,0x00,0x1c,0xc0,0x01,0x00,0x22,0x20,0x02,0x00,0x41,0x10,0x04,0x00,0x41,0x10,0x04,0x00,0x41,0x10,0x04,0x00,0x22,0x20,0x02,0x00,0x1c,0xc0,0x01,0x00,0x00,0x00,0x00]},
sand        : {w : 32, h : 32, bits : [0xf6,0xf3,0xf9,0xcf,0x5c,0xdf,0x7f,0xe5,0xdf,0x7f,0x73,0xfd,0xb7,0xb1,0xef,0x95,0xbd,0xfe,0xfd,0xbb,0xea,0x7f,0xbb,0xff,0xb6,0xe9,0xf7,0x5d,0xff,0xfe,0xff,0xff,0xdd,0x3f,0xbd,0xee,0x76,0xfb,0xeb,0x76,0x6f,0xfb,0xef,0xeb,0xdf,0xd7,0xf6,0xf2,0xfa,0xdc,0xef,0x7b,0xdf,0xbf,0xb3,0xf7,0xfe,0xfa,0xfe,0xf7,0x9f,0x7f,0xb7,0xbf,0xdd,0xcf,0xf9,0xff,0xfe,0xed,0xbe,0x9e,0x3d,0xf7,0x9f,0xdf,0xe7,0xbf,0xe5,0xdc,0xfd,0x9f,0x7f,0x4f,0xbf,0xbd,0xbf,0xef,0xef,0x7b,0xff,0xff,0xb5,0xdf,0x7b,0xfd,0xad,0xdc,0x5f,0x6f,0x6f,0xdf,0xff,0xff,0x7e,0x9f,0xf9,0xf7,0x77,0xff,0x97,0xbf,0xf7,0xe3,0xff,0xfe,0xfb,0xfb,0xfa,0xaf,0xfb,0x6d,0x9f,0xb3,0x37,0xdf,0xdb,0xfd]},
sand1       : {w : 32, h : 32, bits : [0xed,0xe7,0xf3,0xcf,0x5c,0xdf,0x7f,0xe5,0xdf,0xef,0x73,0xfd,0xb7,0xa1,0x2f,0x95,0xbd,0x9e,0xf5,0xba,0xea,0x7e,0xbb,0xff,0x36,0xe9,0xc4,0x5c,0xf7,0xca,0xff,0xfd,0x49,0x1f,0xbd,0xea,0x62,0x4b,0xe1,0x76,0x6b,0xb3,0xae,0xe3,0xcb,0x95,0xf6,0xe2,0xfa,0xdc,0xef,0x7b,0xcf,0xbf,0x93,0xd6,0x2a,0xaa,0xbe,0xd7,0x9b,0x73,0xb7,0x9e,0xdd,0xce,0xf9,0xd2,0xde,0xed,0xbe,0x9e,0x3d,0x77,0x9f,0xdd,0x47,0x9f,0xe5,0xd4,0xfd,0x95,0x2b,0x4d,0xbf,0xbd,0xaf,0xef,0xef,0x7b,0xef,0xd9,0x75,0xde,0x59,0xdd,0xad,0x58,0x5b,0x4d,0x6f,0xdb,0xef,0xfb,0x3e,0x9f,0xf9,0xf3,0x13,0xfb,0x97,0xbc,0x77,0xe3,0xff,0xee,0x7b,0xfa,0xfa,0xaf,0xfb,0x6d,0x9f,0xb3,0x37,0xdf,0xdb,0xfd]},
shaded      : {w : 32, h : 32, bits : [0xa4,0x12,0x23,0xd2,0x4a,0x8c,0x54,0x25,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x8b,0x94,0x94,0x94,0x44,0x49,0x49,0x49,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0xa4,0xa4,0xa4,0xa4,0x4a,0x4a,0x4a,0x4a,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x25,0x25,0x25,0x25,0x52,0x52,0x52,0x52,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0xa4,0xa4,0xa4,0xa4,0x4a,0x4a,0x4a,0x4a,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x25,0x25,0x25,0x25,0x52,0x52,0x52,0x52,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0xa4,0xa4,0xa4,0xa4,0x4a,0x4a,0x4a,0x4a]},
sm_check    : {w : 16, h : 16, bits : [0x55,0x55,0xaa,0xaa,0x55,0x55,0xaa,0xaa,0x55,0x55,0xaa,0xaa,0x55,0x55,0xaa,0xaa,0x55,0x55,0xaa,0xaa,0x55,0x55,0xaa,0xaa,0x55,0x55,0xaa,0xaa,0x55,0x55,0xaa,0xaa]},
steel       : {w : 32, h : 32, bits : [0x80,0x08,0x80,0x08,0x40,0x04,0x40,0x04,0x20,0x02,0x20,0x02,0x10,0x01,0x10,0x01,0x88,0x00,0x88,0x00,0x44,0x00,0x44,0x00,0x22,0x00,0x22,0x00,0x11,0x00,0x11,0x00,0x08,0x80,0x08,0x80,0x04,0x40,0x04,0x40,0x02,0x20,0x02,0x20,0x01,0x10,0x01,0x10,0x00,0x88,0x00,0x88,0x00,0x44,0x00,0x44,0x00,0x22,0x00,0x22,0x00,0x11,0x00,0x11,0x80,0x08,0x80,0x08,0x40,0x04,0x40,0x04,0x20,0x02,0x20,0x02,0x10,0x01,0x10,0x01,0x88,0x00,0x88,0x00,0x44,0x00,0x44,0x00,0x22,0x00,0x22,0x00,0x11,0x00,0x11,0x00,0x08,0x80,0x08,0x80,0x04,0x40,0x04,0x40,0x02,0x20,0x02,0x20,0x01,0x10,0x01,0x10,0x00,0x88,0x00,0x88,0x00,0x44,0x00,0x44,0x00,0x22,0x00,0x22,0x00,0x11,0x00,0x11]},
vert_strip  : {w : 32, h : 32, bits : [0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00,0xff,0x00]},
vert_slash  : {w : 32, h : 32, bits : [0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11]},
wall        : {w : 32, h : 32, bits : [0x21,0x01,0x01,0x11,0x02,0x22,0xa2,0x42,0x84,0x94,0x04,0x14,0x48,0x08,0x88,0x48,0x10,0x10,0x10,0x12,0x24,0x21,0x2a,0x29,0x40,0x40,0x40,0x40,0x80,0x90,0x90,0x84,0x09,0x01,0x05,0x21,0x02,0x02,0x42,0x12,0x84,0xa4,0x04,0x04,0x08,0x08,0x08,0x08,0x12,0x10,0x51,0x10,0xa0,0x22,0x20,0x24,0x42,0x40,0x40,0x40,0x80,0x80,0x84,0x80,0x09,0x11,0x21,0x11,0x42,0x02,0x02,0x42,0x04,0x44,0x04,0x24,0x08,0x08,0x49,0x08,0x12,0x10,0x10,0x12,0x20,0x21,0x24,0x20,0x42,0x40,0x40,0x48,0x90,0x90,0x94,0x80,0x01,0x41,0x41,0x01,0x02,0x02,0x12,0x22,0x44,0x05,0x04,0x04,0x08,0x48,0x49,0x08,0x11,0x11,0x10,0x10,0x20,0x22,0x21,0x22,0x45,0x40,0x40,0x40,0x80,0x80,0x80,0x80]},
westlogo    : {w : 32, h : 32, bits : [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xe0,0x0f,0x00,0x00,0x1c,0x70,0x00,0x00,0x02,0x80,0x00,0x80,0x01,0x00,0x03,0x40,0x00,0x00,0x04,0x40,0x00,0x00,0x04,0x20,0x00,0x00,0x08,0x10,0x00,0x00,0x10,0x90,0x83,0x83,0x13,0x90,0x83,0x83,0x13,0x88,0x83,0x83,0x23,0x08,0x01,0x01,0x21,0x08,0x82,0x82,0x20,0x08,0x82,0x82,0x20,0x08,0x44,0x44,0x20,0x08,0x44,0x44,0x20,0x08,0x28,0x28,0x20,0x10,0x28,0x28,0x10,0x10,0x10,0x10,0x10,0x10,0x00,0x00,0x10,0x20,0x00,0x00,0x08,0x40,0xf8,0x3f,0x04,0x40,0xf8,0x3f,0x04,0x80,0x01,0x00,0x03,0x00,0x02,0x80,0x00,0x00,0x1c,0x70,0x00,0x00,0xe0,0x0f,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]},
woodfin     : {w : 32, h : 32, bits : [0x00,0x00,0x00,0xe0,0x00,0x00,0x00,0x18,0x00,0x00,0x00,0x07,0x00,0x00,0xc0,0x01,0x00,0x00,0x30,0x00,0x00,0x00,0x0c,0x00,0x00,0x00,0x07,0x00,0x00,0x60,0x01,0x00,0x00,0x14,0x00,0x00,0x00,0x03,0x00,0x00,0xc0,0x00,0x00,0x00,0x38,0x00,0x00,0x00,0x0c,0x00,0x00,0x00,0x02,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0xe0,0x00,0x00,0x00,0x30,0x00,0x00,0x00,0x18,0x00,0x00,0x00,0x06,0x00,0x00,0x80,0x03,0x00,0x00,0xf0,0x00,0x00,0x00,0x18,0x00,0x00,0x00,0x06,0x00,0x00,0xc0,0x01,0x00,0x00,0x30,0x00,0x00,0x00,0x1c,0x00,0x00,0x80,0x03,0x00,0x00,0x60,0x00,0x00,0x00,0x18,0x00,0x00,0x00,0x06,0x00,0x00,0x00,0x01,0x00,0x00,0x00]},
woodfin2    : {w : 32, h : 32, bits : [0x00,0xc0,0x00,0xe0,0x00,0x70,0x00,0x18,0x00,0x18,0x00,0x07,0x00,0x0f,0xc0,0x01,0xe0,0x00,0x30,0x00,0x30,0x00,0x0c,0x00,0x1e,0x00,0x07,0x00,0x03,0x60,0x01,0x00,0x00,0x14,0x00,0xe0,0x00,0x03,0x00,0x38,0xc0,0x00,0x00,0x0c,0x38,0x00,0x00,0x03,0x0c,0x00,0xc0,0x01,0x02,0x00,0x78,0x00,0x01,0x00,0x0f,0x00,0x01,0xc0,0x01,0x00,0x00,0x38,0x00,0xe0,0x00,0x06,0x00,0x30,0x80,0x03,0x00,0x18,0xc0,0x00,0x00,0x06,0x30,0x00,0x80,0x03,0x18,0x00,0xf0,0x00,0x0e,0x00,0x18,0x00,0x03,0x00,0x06,0x00,0x00,0xc0,0x01,0xc0,0x00,0x30,0x00,0x38,0x00,0x1c,0x00,0x06,0x80,0x03,0x80,0x03,0x60,0x00,0xc0,0x00,0x18,0x00,0x38,0x00,0x06,0x00,0x0e,0x00,0x01,0x00,0x01,0x00]}
};

/**
 * Объединяет RGB и альфа в массив текстуры
 */

function fp2texture( fill_pattern_name ) {

	//console.log('fill_pattern_name', fill_pattern_name);

	let fp_name = fill_pattern_name.toLowerCase();

	let gly = FILLPATTERNS[fp_name];

	let bits = gly.bits;
	let width = gly.w;
	let height = gly.h;

	let rgb_fg = PIXI.utils.hex2rgb(COLOR.fg);
	let rgb_bg = PIXI.utils.hex2rgb(COLOR.bg);
	let alpha = 1.0;

	let data = [];
	let count = 0;

	for(let i = 0; i < (width * height / 8); i++) {
		let b = bits[i];
		for(let n = 0; n < 8; n++) {
			// Проверка n-ого бита
			if (b & (1 << n)) {
				// n-th bit is set
				data[count++] = rgb_fg[0];
				data[count++] = rgb_fg[1];
				data[count++] = rgb_fg[2];
				data[count++] = alpha;
			} else {
				// n-th bit is not set
				data[count++] = rgb_bg[0];
				data[count++] = rgb_bg[1];
				data[count++] = rgb_bg[2];
				data[count++] = alpha;
			}
		}
	}

	let out = new Float32Array(data);

	return new PIXI.Texture.fromBuffer(out, width, height);
};

/***************************************************************************
 **************************************************************************/
function Tooltip() {

	var _this = this;

	_this.container = new PIXI.Container();

	_this.tooltip = new PIXI.Graphics();

	_this.padding = 6;
	_this.margin = 15;
	_this.linesMargin = 4;
	_this.w = 0;
	_this.h = 0;

	/***************************************************************************
	 **************************************************************************/
	_this.hide = function() {

		_this.tooltip.visible = false;
		_this.container.visible = false;

//		_this.container.children.forEach(data => {
		_this.container.children.forEach(function(data) {
			if (data.isSprite) {
				data.destroy({ children: true, texture: true, baseTexture: true });
			} else {
				data.clear();
				data.geometry.dispose();
			}
			data.removeChildren();
			_this.container.parent.removeChild(data);
		});

		_this.container.removeChildren();
	}

	/***************************************************************************
	 **************************************************************************/
	_this.show = function(x, y, line) {
		if (flag_init_PopUp) {
			if (typeof WINDOW_diag !== 'undefined') {
				return;
			}
		}

		_this.container.removeChildren();

		_this.container.visible = true;
		_this.tooltip.visible = true;

		let charw = /*96*/128;
		let charh = 256;
//		Gcolor(0x571C33,0xFFD700,0x000000,0);
		Gcolor(0xFFFFFF,0x0018F9,0x000000,0);	// белым по синему
//		Gcolor(0xC0C0C0,0x0018F9,0x000000,0);	// серебрянным по синему
		_this.tooltip = smpl_text(0, 0, "HORZ", -1, -1, line, "VECTOR_OVER", null, charw, charh, 1, false);

		_this.w = charw * line.length;
		_this.h = charh;

		var BB = _this.tooltip.getBounds();
		var bbx = -24 + BB.x; // top left corner x
		var bby = -28 + BB.y; // top left corner y
		var bbw = +48 + BB.width; // width
		var bbh = +14 + BB.height; // height

		_this.tooltip.lineStyle(24, 0xFFFFFF);
		_this.tooltip.drawRect(bbx, bby, bbw, bbh);

		_this.container.addChild(_this.tooltip);

		_this.update(x, y);
	}

	/***************************************************************************
	 **************************************************************************/
	_this.update = function(x, y) {
		x += _this.margin;

		if (x + _this.w > 16384 - _this.margin) {
			x -= _this.w + _this.margin * 2;
		}

		if (y + _this.h > 16384 - _this.margin) {
			y -= _this.h + _this.margin;
		}

		_this.container.x = x;
		_this.container.y = y;
	}
}

/**
 * Ввод числа без использования поля ввода html (это не HTML-мост)
 * 
 * Используем клавиатурное событие keyup – отпускание клавиши
 * 
 */

/*******************************************************************************
 * ENTRY_FLD x y l number type format state font_type font_size
 ******************************************************************************/
function Number_Fld(_x, _y, _max_chars, _fld_num, _type, _format, _state,
		_font_type, _font_num, _char_w, _char_h, _line_width) {

	var _this = this;

	// Координата x
	_this.x = typeof _x !== 'undefined' ? _x : 0;

	// Координата y
	_this.y = typeof _y !== 'undefined' ? _y : 0;

	// Максимальное количество символов, разрешенное для записи в поле ввода
	_this.max_chars = typeof _max_chars !== 'undefined' ? _max_chars : 80;

	// Номер, соотносимый с полем ввода (номер буфера, через который введенные
	// данные записываются в операторскую станцию)
	_this.fld_num = typeof _fld_num !== 'undefined' ? _fld_num : 254;

	// Определяет механизм записи в поле ввода. Вариант выбора: PROGRAM /
	// OPERATOR / BOTH
	_this.type = typeof _type !== 'undefined' ? _type : 'OPERATOR';

	// Формат данных, записываемых в поле ввода. Варианты выбора: ASCII / INT /
	// REAL / BYTE / HEX / EXPONENTIAL
	_this.format = typeof _format !== 'undefined' ? _format : 'REAL';

	// Состояние. Варианты выбора: 1 - активно, 0 - не активно
	_this.state = typeof _state !== 'undefined' ? _state : 1;

	// Типы шрифта. Варианты выбора: BITMAP / BITMAP_OVER / VECTOR / VECTOR_OVER
	_this.font_type = typeof _font_type !== 'undefined' ? _font_type : 'VECTOR';

	// Стандартное количество шрифтов растрового отображения (используется со
	// шрифтами типов bitmap и bitmap_over).
	// Допустимая область значений = 1 ... 8.
	_this.font_num = typeof _font_num !== 'undefined' ? _font_num : null;

	// Ширина знакоместа векторного символа в пикселях (используется со шрифтами
	// типов vector и vector_over).
	// Допустимая область значений = 3 ... 16383.
	_this.char_w = typeof _char_w !== 'undefined' ? _char_w : 927;

	// Высота знакоместа векторного символа в пикселях (используется со шрифтами
	// типов vector и vector_over).
	// Допустимая область значений = 3 ... 16383.
	_this.char_h = typeof _char_h !== 'undefined' ? _char_h : 580;

	// Ширина линии. Для шрифта Ovation Vector допустимая область значений равна
	// 1 - 16.
	// Для всех других векторных шрифтов требуется ввод значения 1, поскольку
	// опция
	// "ширина линии" поддерживается только шрифтом Ovation Vector.
	_this.line_width = typeof _line_width !== 'undefined' ? _line_width : 1;

	_this.valid_characters = {
		96 : '0', // NUM_0
		97 : '1', // NUM_1
		98 : '2', // NUM_2
		99 : '3', // NUM_3
		100 : '4', // NUM_4
		101 : '5', // NUM_5
		102 : '6', // NUM_6
		103 : '7', // NUM_7
		104 : '8', // NUM_8
		105 : '9', // NUM_9
		109 : '-', // SUBTRACT
		107 : '+', // ADD
		110 : '.', // DECIMAL_POINT

		48 : "0",	// Digit0
		49 : "1",	// Digit1
		50 : "2",	// Digit2
		51 : "3",	// Digit3
		52 : "4",	// Digit4
		53 : "5",	// Digit5
		54 : "6",	// Digit6
		55 : "7",	// Digit7
		56 : "8",	// Digit8
		57 : "9",	// Digit9
		189 : "-",	// Minus
//		187 : "+",	// Equal
		190 : ".",	// Period
	};

	// Инициализируем поле ввода и удаляем пробелы с обоих концов поля
	_this.text = (EntryFieldData[_this.fld_num] + '').trim();

	// Обрезаем поле ввода до разрешенной длины
	if (_this.text.length > _this.max_chars)
		_this.text = _this.text.substring(0, _this.max_chars);

	_this.BACKSPACE = 8;
	_this.ENTER = 13;

	_this.background = new PIXI.Graphics();
	_this.backgroundFocused = new PIXI.Graphics();
	_this.inputfield = new PIXI.Graphics();
	_this.hitRect = new PIXI.Sprite(PIXI.Texture.EMPTY);

	_this.isEnabled = false;

	// Точка входа
	// ==================================================
	_this.input = function() {
		_this.clearObj();
		_this.drawBackground();
	}

	// Очищаем графику, нарисованную для всех
	// графических объектов
	// ==================================================
	_this.clearObj = function() {
		_this.background.clear();
		_this.backgroundFocused.clear();
		_this.inputfield.clear();
		_this.hitRect.interactive = false;
	}

	//
	// ==================================================
	_this.drawBackground = function() {
		let xr = _this.x - _this.char_w * 0.1;
		let yr = _this.y;
		let wr = _this.char_w * _this.max_chars + _this.char_w * 0.2;
		let hr = _this.char_h * 0.92;

		_this.background.beginFill(0x00bfff, 1);	// голубой
		_this.background.lineStyle(32, 0x00bfff);
		_this.background.drawRoundedRect(xr, yr, wr, hr, (Math.min.apply(null, [ wr, hr ]) * 0.25));
		_this.background.endFill();
		_this.background.visible = true;

		_this.backgroundFocused.beginFill(0xff00ff, 1);	// малиновый
		_this.backgroundFocused.lineStyle(32, 0xff00ff);
		_this.backgroundFocused.drawRoundedRect(xr, yr, wr, hr, (Math.min.apply(null, [ wr, hr ]) * 0.25));
		_this.backgroundFocused.endFill();
		if (_this.isEnabled) {
			_this.backgroundFocused.visible = true;
		} else {
			_this.backgroundFocused.visible = false;
		}


		_this.inputfield = smpl_text(
				_this.x, _this.y, "HORZ",
				0,					// выравнивание по левому краю
				_this.max_chars,	// кол-во символов для выравнивания
				_this.text, _this.font_type, _this.font_num, _this.char_w, _this.char_h * 0.9, _this.line_width, false);

		_this.hitRect.x = xr;
		_this.hitRect.y = yr;
		_this.hitRect.width = wr;
		_this.hitRect.height = hr;
		_this.hitRect.interactive = true;
		_this.hitRect.buttonMode = true;

//		if (_this.isEnabled) {
//			_this.hitRect.cursor = 'text';
//		} else {
//			_this.hitRect.cursor = 'pointer';
//		}


		// курсор над элементом
/*		_this.hitRect.mouseover = _this.onFocus;	*/

		// курсор уходит с элемента
/*		_this.hitRect.mouseout = _this.onBlur;		*/

		// кнопка нажата
		_this.hitRect.mousedown = _this.onFocus;

		// кнопка отпущена
		_this.hitRect.mouseup = _this.onFocus;

	}

	// курсор над элементом
	// ==================================================
	_this.onFocus = function(event) {
//		_this.hitRect.cursor = 'text';
		_this.backgroundFocused.visible = true;
		_this.enable();
	}

	// курсор уходит с элемента
	// ==================================================
	_this.onBlur = function(event) {
//		_this.hitRect.cursor = 'pointer';
		_this.backgroundFocused.visible = false;
		_this.disable();
	}

	// Слушать события клавиатуры
	// ==================================================
	_this.enable = function() {
		if (!_this.isEnabled) {
			_this.isEnabled = true;
			_this._enableEvents();
		}
	}

	// Присоединить слушателей событий клавиатуры
	// ==================================================
	_this._enableEvents = function() {
		_this._disableEvents();
		EntryFieldKeyUpHandler = _this._onKeyUp.bind(_this);
		window.addEventListener('keyup', EntryFieldKeyUpHandler, true);
	}

	// Не слушать события клавиатуры
	// ==================================================
	_this.disable = function() {
		if (_this.isEnabled) {
			_this.isEnabled = false;
			_this._disableEvents();
		}
	}

	// Отключить слушателей событий клавиатуры
	// ==================================================
	_this._disableEvents = function() {
		if (!(typeof EntryFieldKeyUpHandler === 'undefined')) {
			window.removeEventListener('keyup', EntryFieldKeyUpHandler, true);
		}
	}

	// при отпускании клавиши
	// ==================================================
	_this._onKeyUp = function(evt) {
		if (!_this.isEnabled) return;

		var key = evt.which || evt.keyCode;

		if (key === _this.ENTER) {
			EntryFieldData[_this.fld_num] = _this.text;

		} else if (key === _this.BACKSPACE) {
			_this.backspace();

		} else if (_this.valid_characters[key] != undefined) {
			_this.add(_this.valid_characters[key]);

		} else {
			//console.log('any key', key);

		}
	}

	// ==================================================
	_this.add = function(ch) {
		if (_this.text.length < _this.max_chars)
			_this.setText(_this.text + ch);
	}

	// ==================================================
	_this.backspace = function() {
		_this.setText(_this.text.slice(0, -1));
	}

	// ==================================================
	_this.setText = function(text) {
		EntryFieldData[_this.fld_num] = _this.text = text;
		_this.inputfield.clear();
		_this.inputfield = smpl_text(
				_this.x, _this.y, "HORZ",
				0,					// выравнивание по левому краю
				_this.max_chars,	// кол-во символов для выравнивания
				_this.text, _this.font_type, _this.font_num, _this.char_w, _this.char_h * 0.9, _this.line_width, false);
	}

} // Number_Fld

/*******************************************************************************
 * !!! Бар загрузки !!!*
 ******************************************************************************/
function LoadingBar() {
	var _this = this;

	_this.graphics = new PIXI.Graphics();

	_this.x = 5462;
	_this.y = 5462;
	_this.w = 5462;
	_this.h = 5462*4/3;
	_this.angle1 = 0;
	_this.angle2 = 0;

	_this.width = 333;

	_this.blue = 0x0018F9;
	_this.silver = 0xC0C0C0;
	_this.color = _this.blue;

	_this.alpha = 0.75;

	/***************************************************************************
	 **************************************************************************/
	_this.hide = function() {
		_this.graphics.visible = false;
	}

	/***************************************************************************
	 **************************************************************************/
	_this.show = function() {
		_this.graphics.visible = true;
		_this.update();
	}

	/***************************************************************************
	 **************************************************************************/
	_this.draw = function(a_x, a_y, a_w, a_h, a_angle1, a_angle2) {

		_this.graphics.lineStyle(_this.width, _this.color, _this.alpha);

		let x = a_x+(a_w/2),
		y = a_y+(a_h/2),
		startAngle = a_angle1,
		arc = a_angle2,
		radius = a_w/2,
		yRadius = a_h/2;
		let segAngle, theta, angle, angleMid, segs, ax, ay, bx, by, cx, cy;

		if (Math.abs(arc)>360) arc = 360;
		segs = Math.ceil(Math.abs(arc)/6);
		segAngle = arc/segs;
		theta = -(segAngle/180)*Math.PI;
		angle = -(startAngle/180)*Math.PI;
		if (segs>0) {
			ax = x+Math.cos(startAngle/180*Math.PI)*radius;
			ay = y+Math.sin(-startAngle/180*Math.PI)*yRadius;
			_this.graphics.moveTo(Math.round(ax), Math.round(ay));
			for (let i = 0; i<segs; i++) {
				angle += theta;
				angleMid = angle-(theta/2);
				bx = x+Math.cos(angle)*radius;
				by = y+Math.sin(angle)*yRadius;
				cx = x+Math.cos(angleMid)*(radius/Math.cos(theta/2));
				cy = y+Math.sin(angleMid)*(yRadius/Math.cos(theta/2));
				_this.graphics.quadraticCurveTo (Math.round(cx), Math.round(cy), Math.round(bx), Math.round(by));
			}
		}
	}

	/***************************************************************************
	 **************************************************************************/
	_this.update = function() {
		_this.graphics.clear();

		let d = new Date();
		let t = d.getMilliseconds();

		_this.a_angle1 = t * 360 / 1000;
		_this.a_angle2 = _this.a_angle1 - 45;

		_this.color = _this.blue;
		_this.draw(
				_this.x, _this.y,
				_this.w, _this.h,
				_this.a_angle1, _this.a_angle2);

		_this.color = _this.silver;
		_this.draw(
				_this.x + 500, _this.y + 500,
				_this.w - 1000, _this.h - 1000,
				- _this.a_angle2 - 45, - _this.a_angle1 - 45);

		_this.color = _this.blue;
		_this.draw(
				_this.x + 500*2, _this.y + 500*2,
				_this.w - 1000*2, _this.h - 1000*2,
				_this.a_angle1 -90, _this.a_angle2-90);
	}
}

/*******************************************************************************
 * !!! Аварийный сигнал !!!*
 ******************************************************************************/
function Blinker() {
	var _this = this;

	_this.container = new PIXI.Container();

	_this.paper = [];

	/**
	 * Очистить массив дисплейный объектов
	 **************************************************/
	_this.clearArray = function() {
		//while (_this.paper.length) {
		//	_this.paper.pop();
		//}
		// будем проще
		_this.paper = [];
	}

	/**
	 * Очистить контейнер от дисплейных объектов
	 **************************************************/
	_this.clearContainer = function() {
		//_this.container.children.forEach(data => {
		_this.container.children.forEach(function(data) {
			if (data.isSprite) {
				data.destroy({ children: true, texture: true, baseTexture: true });
			} else {
				data.clear();
				data.geometry.dispose();
			}
			data.removeChildren();
			_this.container.parent.removeChild(data);
		});
		_this.container.removeChildren();
	}

	/**
	 * Очистить массив и контейнер от дисплейный
	 * объектов
	 **************************************************/
	_this.clear = function() {
		_this.clearArray();
		_this.clearContainer();
	}

	/**
	 * Добавить дисплейный объект к массиву
	 **************************************************/
	_this.push = function(element) {
		_this.paper.push(element);
		// добавить дисплейный объект к контейнеру
		_this.container.addChild(element);
	}

	/**
	 **************************************************/
	_this.update = function() {
		var alpha = (Date.now()%999+1)/999;
//		_this.graphics.lineStyle(1, 0xffff00, alpha*2);
//		_this.graphics.beginFill(0xffff00, alpha/2);
//		_this.graphics.drawRect(_this.x - 44, _this.y - 58, _this.w + 88, _this.h + 116);
//		_this.graphics.endFill();
		_this.container.alpha = alpha;
	}
}





/*******************************************************************************
 * !!! Хайлайтер !!!*
 * 
 * Задача:
 * 
 * Найти требуемое по порядку (номеру) вхождение ключевого текста в контенте
 * видеокадра и графически выделить найденную фразу.
 * 
 * Контент видеокадра ограничен командами языка графики: - Text, - MultiText, -
 * ProcessPT
 * 
 * Реализуем три метода
 * hide, show и update
 * 
 * update для mainLoop
 * hide для отмены текстовыделения
 * show для назначения текстовыделения
 * 
 * /// S.O. (2020-09-01)
 * Отключение мигания хайлайтера по инициативе оператора (mousedown)
 * Disabling blinking of the highlighter initiated by the operator (mousedown)
 * 
 ******************************************************************************/
function Highlighter() {
	var _this = this;

//	_this.container = new PIXI.Container();
	_this.graphics = new PIXI.Graphics();

	// ключевой текст
	_this.key_str = "";
	_this.old_key_str = " ";

	// требуемый номер вхождения, по умолчанию - первый найденный объект
	_this.key_nmb =  1;
	_this.old_key_nmb =  0;

	// порядковый номер (счетчик) вхождения (сброс в 0 функцией set_search())
	_this.ind_nmb =  0;

	// мигание отключено (по умолчанию)
	_this.blink_on =  false;

	// если изменился номер диаграммы или группы или ключевой текст или номер вложения, то включаем мигание
	_this.old_diag =  -1;
	_this.old_group =  -1;

	_this.polygons = [];

	_this.rotation = 0;
	_this.dash = 66;
	_this.gap =  66;
	_this.offsetPercentage = 128;

	_this.x = 0;
	_this.y = 0;
	_this.w = 0;
	_this.h = 0;

	/***************************************************************************
	 * Задать ключевой текст, требуемый номер вхождения
	 * 
	 * <pre>
	 * </pre>
	 **************************************************************************/
	this.set_search = function(text, number) {
		// ключевой текст
		if (text === undefined) {
			_this.key_str = "";
		} else {
			_this.key_str = text;
		}

		// требуемый номер вхождения, по умолчанию - первый найденный объект
		if (number === undefined) {
			_this.key_nmb = 1;
		} else {
			_this.key_nmb = number;
		}

		// если изменился номер диаграммы или группы или
		// ключевой текст или номер вложения, то включаем мигание
		if (_this.old_diag !== QueryArgs.diag) {
			_this.blink_on =  true;	// мигание включено
			_this.old_diag = QueryArgs.diag;
		}
		if (_this.old_group !== QueryArgs.group) {
			_this.blink_on =  true;	// мигание включено
			_this.old_group = QueryArgs.group;
		}
		if (_this.old_key_str !== _this.key_str) {
			_this.blink_on =  true;	// мигание включено
			_this.old_key_str = _this.key_str;
		}
		if (_this.old_key_nmb !== _this.key_nmb) {
			_this.blink_on =  true;	// мигание включено
			_this.old_key_nmb = _this.key_nmb;
		}

		// сбросить порядковый номер (счетчик) вхождения
		_this.ind_nmb = 0;

		// сбросить видимость хайлайтера
		_this.graphics.visible = false;
	}

	/***************************************************************************
	 * Поиск по любому включению искомого текста в тексте объекта без учета
	 * регистра
	 **************************************************************************/
	this.case_insensitive_search = function(str, search_str) {
		if (search_str === undefined)
			return false;

		if (search_str.length == 0)
			return false;

		var result = str.search(new RegExp(search_str, "i"));

		if (result >= 0)
			return true;
		else
			return false;
	}

	/***************************************************************************
	 **************************************************************************/
	this.search = function(_cur_value) {
		if (this.case_insensitive_search(_cur_value, _this.key_str)) {
			++_this.ind_nmb;
			if (_this.key_nmb == _this.ind_nmb)
				return true;
			else
				return false;
		}
	}

	/***************************************************************************
	 * Отключение мигания по инициативе оператора
	 **************************************************************************/
	_this.blink_off = function() {
		_this.blink_on = false;
		_this.graphics.visible = false;
	}

	/***************************************************************************
	 **************************************************************************/
	_this.show = function(x, y, w, h) {
		_this.x = x;
		_this.y = y;
		_this.w = w;
		_this.h = h;

		if (_this.blink_on) _this.graphics.visible = true;
		_this.draw();
	}

	/***************************************************************************
	 **************************************************************************/
	_this.update = function() {
		_this.draw();
	}

	/***************************************************************************
	 **************************************************************************/
	_this.draw = function() {
		if ( _this.x && _this.y && _this.w && _this.h === 0) return;

		_this.graphics.clear();
//		_this.polygons = [];
//		_this.polygons.push({x:_this.x        , y:_this.y});
//		_this.polygons.push({x:_this.x+_this.w, y:_this.y});
//		_this.polygons.push({x:_this.x+_this.w, y:_this.y+_this.h});
//		_this.polygons.push({x:_this.x        , y:_this.y+_this.h});

//		_this.graphics.lineStyle(66, 0xFF0000, 0.95);
//		_this.graphics.lineStyle(44, 0xe81919, 1.00);
//		_this.graphics.lineStyle(44, 0xff2626, 1.00);

//		_this.drawDashedPolygon(_this.polygons, 0, 0, _this.rotation, _this.dash, _this.gap, (Date.now()%_this.offsetPercentage + 1) / _this.offsetPercentage);

		var alpha = (Date.now()%333+1)/333;
		_this.graphics.lineStyle(1, 0xffff00, alpha*2);
		_this.graphics.beginFill(0xffff00, alpha/2);
		_this.graphics.drawRect(_this.x - 44, _this.y - 58, _this.w + 88, _this.h + 116);
		_this.graphics.endFill();

	}

	/***************************************************************************
	 * Draws a dashed polygon
	 **************************************************************************/
	_this.drawDashedPolygon = function(polygons, x, y, rotation, dash, gap, offsetPercentage) {
		var i;
		var p1;
		var p2;
		var dashLeft = 0;
		var gapLeft = 0;

		if(offsetPercentage>0) {
			var progressOffset = (dash+gap)*offsetPercentage;

			if(progressOffset < dash)
				dashLeft = dash-progressOffset;
			else
				gapLeft = gap-(progressOffset-dash);
		}

		var rotatedPolygons = [];

		for(i = 0; i<polygons.length; i++) {
			var p = {x:polygons[i].x, y:polygons[i].y};
			var cosAngle = Math.cos(rotation);
			var sinAngle = Math.sin(rotation);
			var dx = p.x;
			var dy = p.y;
			p.x = (dx*cosAngle-dy*sinAngle);
			p.y = (dx*sinAngle+dy*cosAngle);
			rotatedPolygons.push(p);
		}

		for(i = 0; i<rotatedPolygons.length; i++) {
			p1 = rotatedPolygons[i];

			if(i == rotatedPolygons.length-1)
				p2 = rotatedPolygons[0];
			else
				p2 = rotatedPolygons[i+1];

			var dx = p2.x-p1.x;
			var dy = p2.y-p1.y;
			var len = Math.sqrt(dx*dx+dy*dy);
			var normal = {x:dx/len, y:dy/len};
			var progressOnLine = 0;
			_this.graphics.moveTo(x+p1.x+gapLeft*normal.x, y+p1.y+gapLeft*normal.y);

			while(progressOnLine<=len) {
				progressOnLine+=gapLeft;

				if(dashLeft > 0)
					progressOnLine += dashLeft;
				else
					progressOnLine+= dash;

				if(progressOnLine>len) {
					dashLeft = progressOnLine-len;
					progressOnLine = len;
				} else {
					dashLeft = 0;
				}

				_this.graphics.lineTo(x+p1.x+progressOnLine*normal.x, y+p1.y+progressOnLine*normal.y);
				progressOnLine+= gap;

				if(progressOnLine>len && dashLeft == 0) {
					gapLeft = progressOnLine-len;
					// console.log(progressOnLine, len, gap);
				} else {
					gapLeft = 0;
					_this.graphics.moveTo(x+p1.x+progressOnLine*normal.x, y+p1.y+progressOnLine*normal.y);
				}
			} // while
		} // for
	} // _this.drawDashedPolygon

}

/**
 * 
 * http://somov.inf.ua/library/pixijs/index.html?Newtopic8.html
 * 
 * https://www.html5gamedevs.com/topic/23690-confused-by-dragging-example-what-is-the-argument-passed-to-ondragstart/
 * 
 * <pre>
 *        A             E               B
 *    +--------+------------------+--------+
 *  C |    1   |        2         |   3    |
 *    +--------+------------------+--------+
 *  F |    4   |        5         |   6    |
 *    +--------+------------------+--------+
 *  D |    7   |        8         |   9    |
 *    +--------+------------------+--------+
 * </pre>
 */

var BorderColor = 0xB2BABB;
var HeaderColor = 0x3498DB;

/**
 **************************************************/
function Modalwin(centerWidth, centerHeight, leftWidth, topHeight, rightWidth, bottomHeight) {

	var _this = this;

	_this.container = new PIXI.Container();

	// size of the center vertical bar (E)
	_this.centerWidth = typeof centerWidth !== 'undefined' ? centerWidth : 2500;
	// size of the center horizontal bar (F)
	_this.centerHeight = typeof centerHeight !== 'undefined' ? centerHeight : 14000;
	// size of the left vertical bar (A)
	_this.leftWidth = typeof leftWidth !== 'undefined' ? leftWidth : 60;
	// size of the right vertical bar (B)
	_this.rightWidth = typeof rightWidth !== 'undefined' ? rightWidth : 60;
	// size of the top horizontal bar (C)
	_this.topHeight = typeof topHeight !== 'undefined' ? topHeight : 600;
	// size of the bottom horizontal bar (D)
	_this.bottomHeight = typeof bottomHeight !== 'undefined' ? bottomHeight : 120;

	_this.tleft  = new PIXI.Graphics();	// 1
	_this.top    = new PIXI.Graphics();	// 2
	_this.tright = new PIXI.Graphics();	// 3
	_this.left   = new PIXI.Graphics();	// 4

	_this.center = new PIXI.Graphics();	// 5

	_this.right  = new PIXI.Graphics();	// 6
	_this.dleft  = new PIXI.Graphics();	// 7
	_this.down   = new PIXI.Graphics();	// 8
	_this.dright = new PIXI.Graphics();	// 9

	_this.header = new PIXI.Graphics();	// 10
	_this.close  = new PIXI.Graphics();	// 11
	_this.title  = new PIXI.Graphics();	// 12

	_this.x = 30;
	_this.y = 90;
	_this.w = _this.leftWidth + _this.centerWidth + _this.rightWidth;
	_this.h = _this.topHeight + _this.centerHeight + _this.bottomHeight;

	_this.str_title = 'Title';

	_this.bgcolor = 0x000000;
	_this.paper = [];

	/***************************************************************************
	 **************************************************************************/
	_this.setPaper = function(paper) {
		_this.paper = paper;
	}

	/***************************************************************************
	 **************************************************************************/
	_this.setParam = function(diag, dispx, dispy, bgcolor, paper) {
		_this.str_title = diag;

		_this.x = dispx;
		_this.y = dispy;

		_this.bgcolor = bgcolor;
		_this.paper = paper;
	}

	/***************************************************************************
	 * Удаляет с экрана окно управления
	 **************************************************************************/
	_this.Delete = function() {
		_this.paper = [];
		_this.hide();
	}

	/**
	 **************************************************/
	_this.Open = function() {
		//_this.container.children.forEach(data => {
		_this.container.children.forEach(function(data) {
			if (data.isSprite) {
				data.destroy({ children: true, texture: true, baseTexture: true });
			} else {
				data.clear();
				data.geometry.dispose();
			}
			//data.removeChildren(); не применяй - не работает
			_this.container.parent.removeChild(data);
		});
		_this.container.removeChildren();

		_this.container.position.x = _this.x;
		_this.container.position.y = _this.y;

		_this.window_frames();
		_this.window_center();
	}

	/**
	 **************************************************/
	_this.Hide = function() {

		flag_init_PopUp = false;

		// Очищаем графику, нарисованную для всех графических объектов рамки окна
		_this.tleft.clear();	// верхний левый
		_this.top.clear();		// верхний центральный
		_this.tright.clear();	// верхний правый

		_this.header.clear();	// заголовок
		_this.title.clear();	// заголовок
		_this.close.clear();	// Close Button

		_this.left.clear();		// центральный левый
		_this.right.clear();	// центральный правый

		_this.dleft.clear();	// нижний левый
		_this.down.clear();		// нижний центральный
		_this.dright.clear();	// нижний правый

		_this.center.clear();

		//_this.container.children.forEach(data => {
		_this.container.children.forEach(function(data) {
			if (data.isSprite) {
				data.destroy({ children: true, texture: true, baseTexture: true });
			} else {
				data.clear();
				data.geometry.dispose();
			}
			data.removeChildren();
			_this.container.parent.removeChild(data);
		});
		_this.container.removeChildren();
	}

	/**
	 **************************************************/
	_this.window_frames = function() {

		// Очищаем графику, нарисованную для всех графических объектов рамки окна
		_this.tleft.clear();	// верхний левый
		_this.top.clear();		// верхний центральный
		_this.tright.clear();	// верхний правый

		_this.header.clear();	// заголовок
		_this.title.clear();	// заголовок
		_this.close.clear();	// Close Button

		_this.left.clear();		// центральный левый
		_this.right.clear();	// центральный правый

		_this.dleft.clear();	// нижний левый
		_this.down.clear();		// нижний центральный
		_this.dright.clear();	// нижний правый

		// верхний левый
		// ======================================================================
		_this.tleft.clear();
		_this.tleft.beginFill(BorderColor, 1);
		_this.tleft.drawRect(0, 0, _this.leftWidth, _this.topHeight);
		_this.tleft.endFill();
		_this.tleft.interactive = true;
		_this.tleft.cursor = 'nwse-resize';
		_this.tleft
			.on('pointerdown',      _this._onDragStart)
			.on('pointerup',        _this._onDragEnd)
			.on('pointerupoutside', _this._onDragEnd)
			.on('pointermove',      _this.tleft_onMove);
		_this.container.addChild(_this.tleft);

		// верхний центральный
		// ======================================================================
		_this.top.beginFill(BorderColor, 1);
		_this.top.drawRect(_this.leftWidth, 0, _this.centerWidth, _this.topHeight);
		_this.top.endFill();
		_this.top.interactive = true;
		_this.top.cursor = 'ns-resize';
		_this.top
			.on('pointerdown',      _this._onDragStart)
			.on('pointerup',        _this._onDragEnd)
			.on('pointerupoutside', _this._onDragEnd)
			.on('pointermove',      _this.top_onMove);
		_this.container.addChild(_this.top);

		// верхний правый
		// ======================================================================
		_this.tright.beginFill(BorderColor, 1);
		_this.tright.drawRect(_this.leftWidth + _this.centerWidth - (_this.leftWidth), 0, _this.rightWidth + (_this.leftWidth), _this.topHeight);
		_this.tright.endFill();
		_this.tright.interactive = true;
		_this.tright.cursor = 'nesw-resize';
		_this.tright
			.on('pointerdown',      _this._onDragStart)
			.on('pointerup',        _this._onDragEnd)
			.on('pointerupoutside', _this._onDragEnd)
			.on('pointermove',      _this.tright_onMove);
		_this.container.addChild(_this.tright);

		// заголовок
		// ======================================================================
		_this.header.beginFill(HeaderColor, 1);
		_this.header.drawRect(
				_this.leftWidth, _this.bottomHeight,
				_this.rightWidth + _this.centerWidth - _this.leftWidth, _this.topHeight - _this.bottomHeight * 2);
		_this.header.endFill();
		_this.header.interactive = true;
		_this.header.cursor = 'move';
		// setup events for mouse + touch using the pointer events
		_this.header
			.on('pointerdown',      _this.header_onDragStart)
			.on('pointerup',        _this.header_onDragEnd)
			.on('pointerupoutside', _this.header_onDragEnd)
			.on('pointermove',      _this.header_onDragMove);
		_this.container.addChild(_this.header);

		// Title Text
		// ======================================================================
		Gcolor(0x000000,0x000000,0x000000,0);
		_this.title = smpl_text(
				_this.leftWidth, _this.bottomHeight,
				"HORZ", -1, -1,
				' ' + _this.str_title,
				"VECTOR", null,
				/*94*/86, /*257*/_this.topHeight - _this.bottomHeight * 1.6,
				0, false);
		_this.container.addChild(_this.title);

		// Close Button
		// ======================================================================
		let x = _this.centerWidth - (_this.leftWidth + _this.rightWidth) * 1.6;
		let y = _this.topHeight / 4.2;
		let w = (_this.leftWidth + _this.rightWidth) * 2;
		let h = _this.topHeight / 2;
		_this.close.beginFill(BorderColor,1).drawRoundedRect(x,y,w,h,(Math.min.apply(null,[w,h])*0.25)).endFill();
		_this.close.lineStyle(32,0x000,1).moveTo(x+50,y+50).lineTo(x+w-50,y+h-50);
		_this.close.lineStyle(32,0x000,1).moveTo(x+50,y+h-50).lineTo(x+w-50,y+50);
		_this.close.interactive = true;
		_this.close.buttonMode = true;
		_this.close.hitArea = new PIXI.Rectangle(x, y, w, h);
		//_this.close.click = function(ev) {
		_this.close.mouseup = function(ev) {
			/*console.log("Close Button clicked");*/
			/*console.log("Close Button mouseup");*/
			_this.Hide();
			flag_init_PopUp = false;
		}
		_this.container.addChild(_this.close);

		// центральный левый
		// ======================================================================
		_this.left.beginFill(BorderColor, 1);
		_this.left.drawRect(0, _this.topHeight, _this.leftWidth, _this.centerHeight);
		_this.left.endFill();
		_this.left.interactive = true;
		_this.left.cursor = 'ew-resize';
		_this.left
			.on('pointerdown',      _this._onDragStart)
			.on('pointerup',        _this._onDragEnd)
			.on('pointerupoutside', _this._onDragEnd)
			.on('pointermove',      _this.left_onMove);
		_this.container.addChild(_this.left);

		// центральный правый
		// ======================================================================
		_this.right.beginFill(BorderColor, 1);
		_this.right.drawRect(_this.leftWidth + _this.centerWidth, _this.topHeight, _this.rightWidth, _this.centerHeight);
		_this.right.endFill();
		_this.right.interactive = true;
		_this.right.cursor = 'ew-resize';
		_this.right
			.on('pointerdown',      _this._onDragStart)
			.on('pointerup',        _this._onDragEnd)
			.on('pointerupoutside', _this._onDragEnd)
			.on('pointermove',      _this.right_onMove);
		_this.container.addChild(_this.right);

		// нижний левый
		// ======================================================================
		_this.dleft.beginFill(BorderColor, 1);
		_this.dleft.drawRect(0, _this.topHeight + _this.centerHeight, _this.leftWidth, _this.bottomHeight);
		_this.dleft.endFill();
		_this.dleft.interactive = true;
		_this.dleft.cursor = 'nesw-resize';
		_this.dleft
			.on('pointerdown',      _this._onDragStart)
			.on('pointerup',        _this._onDragEnd)
			.on('pointerupoutside', _this._onDragEnd)
			.on('pointermove',      _this.dleft_onMove);
		_this.container.addChild(_this.dleft);

		// нижний центральный
		// ======================================================================
		_this.down.beginFill(BorderColor, 1);
		_this.down.drawRect(_this.leftWidth,  _this.topHeight + _this.centerHeight, _this.centerWidth, _this.bottomHeight);
		_this.down.endFill();
		_this.down.interactive = true;
		_this.down.cursor = 'ns-resize';
		_this.down
			.on('pointerdown',      _this._onDragStart)
			.on('pointerup',        _this._onDragEnd)
			.on('pointerupoutside', _this._onDragEnd)
			.on('pointermove',      _this.down_onMove);
		_this.container.addChild(_this.down);

		// нижний правый
		// ======================================================================
		_this.dright.beginFill(BorderColor, 1);
		_this.dright.drawRect(_this.leftWidth + _this.centerWidth, _this.topHeight + _this.centerHeight, _this.rightWidth, _this.bottomHeight);
		_this.dright.endFill();
		_this.dright.interactive = true;
		_this.dright.cursor = 'nwse-resize';
		_this.dright
			.on('pointerdown',      _this._onDragStart)
			.on('pointerup',        _this._onDragEnd)
			.on('pointerupoutside', _this._onDragEnd)
			.on('pointermove',      _this.dright_onMove);
		_this.container.addChild(_this.dright);

	} // window_frames

	/**************************************************
	 * Отрисовка центра окна
	 **************************************************/
	_this.window_center = function() {

		// Очищаем графику, нарисованную для всех графических объектов центральной цасти окна
		//_this.center.children.forEach(data => {
		_this.center.children.forEach(function(data) {
			if (data.isSprite) {
				data.destroy({ children: true, texture: true, baseTexture: true });
			} else {
				data.clear();
				data.geometry.dispose();
			}
			data.removeChildren();
			//_this.center.parent.removeChild(data);
		});
		_this.center.removeChildren();
		_this.center.clear();	// все секции PopUp видеокадра

		// центральный
		// ======================================================================
		_this.center.beginFill(_this.bgcolor, 1);
		_this.center.drawRect(_this.leftWidth, _this.topHeight, _this.centerWidth, _this.centerHeight);
		_this.center.endFill();
		_this.center.interactive = true;

		let shapeMatrix = Wdpf_matrix();
		shapeMatrix.translate(_this.leftWidth/* - 30*/, _this.topHeight/* - 90*/);
		shapeMatrix.scale(_this.centerWidth/(16384/*-30*/), _this.centerHeight/(16384/*-90*/), 0, 0);
		let pixiShapeMatrix = new PIXI.Matrix(shapeMatrix.a, shapeMatrix.b,
				shapeMatrix.c, shapeMatrix.d, shapeMatrix.e, shapeMatrix.f);

		for(let el in _this.paper) {
			let shape = _this.paper[ el ];
//			shape.transform.setFromMatrix(pixiShapeMatrix);	ломает шэйпы !!!
			_this.center.addChild(shape);
		}

		_this.center.transform.setFromMatrix(pixiShapeMatrix);	// не ломает шэйпы

		_this.container.addChild(_this.center);

	}

	/**************************************************
	 * Тянем - начало
	 **************************************************/

	/**
	 * тянем за верхний левый
	 **************************************************/
	_this.tleft_onMove = function (event) {
		let x = event.data.global.x / window.innerWidth;
		if (x < 0 || x > 1.0) return;
		let y = event.data.global.y / window.innerHeight;
		if (y < 0 || y > 1.0) return;
		if (this.lastPosition) {
			let newPosition = {//event.data.getLocalPosition(this.parent);
				x: x * 16384,
				y: y * 16384
			};
			_this.centerWidth += (this.lastPosition.x - newPosition.x);		// центральный
																			// левый
			_this.x += (newPosition.x - this.lastPosition.x);
			_this.centerHeight += (this.lastPosition.y - newPosition.y);	// верхний
																			// центральный
			_this.y += (newPosition.y - this.lastPosition.y);
			this.lastPosition = newPosition;
		}
	}

	/**
	 * тянем за центральный левый
	 **************************************************/
	_this.left_onMove = function (event) {
		let x = event.data.global.x / window.innerWidth;
		if (x < 0 || x > 1.0) return;
		let y = event.data.global.y / window.innerHeight;
		if (y < 0 || y > 1.0) return;
		if (this.lastPosition) {
			let newPosition = {//event.data.getLocalPosition(this.parent);
				x: x * 16384,
				y: y * 16384
			};
			_this.centerWidth += (this.lastPosition.x - newPosition.x);
			_this.x += (newPosition.x - this.lastPosition.x);
			this.lastPosition = newPosition;
		}
	}

	/**
	 * тянем за нижний левый
	 **************************************************/
	_this.dleft_onMove = function (event) {
		let x = event.data.global.x / window.innerWidth;
		if (x < 0 || x > 1.0) return;
		let y = event.data.global.y / window.innerHeight;
		if (y < 0 || y > 1.0) return;
		if (this.lastPosition) {
			let newPosition = {//event.data.getLocalPosition(this.parent);
				x: x * 16384,
				y: y * 16384
			};
			_this.centerWidth += (this.lastPosition.x - newPosition.x);		// центральный
																			// левый
			_this.x += (newPosition.x - this.lastPosition.x);

			_this.centerHeight += (newPosition.y - this.lastPosition.y);	// нижний
																			// центральный
			this.lastPosition = newPosition;
		}
		
	}

	/**
	 * тянем за верхний правый
	 **************************************************/
	_this.tright_onMove = function (event) {
		let x = event.data.global.x / window.innerWidth;
		if (x < 0 || x > 1.0) return;
		let y = event.data.global.y / window.innerHeight;
		if (y < 0 || y > 1.0) return;
		if (this.lastPosition) {
			let newPosition = {//event.data.getLocalPosition(this.parent);
				x: x * 16384,
				y: y * 16384
			};
			_this.centerWidth += (newPosition.x - this.lastPosition.x);		// центральный
																			// правый
			_this.centerHeight += (this.lastPosition.y - newPosition.y);	// верхний
																			// центральный
			_this.y += (newPosition.y - this.lastPosition.y);
			this.lastPosition = newPosition;
		}
	}

	/**
	 * тянем за центральный правый
	 **************************************************/
	_this.right_onMove = function (event) {
		let x = event.data.global.x / window.innerWidth;
		if (x < 0 || x > 1.0) return;
		let y = event.data.global.y / window.innerHeight;
		if (y < 0 || y > 1.0) return;
		if (this.lastPosition) {
			let newPosition = {//event.data.getLocalPosition(this.parent);
				x: x * 16384,
				y: y * 16384
			};
			_this.centerWidth += (newPosition.x - this.lastPosition.x);
			this.lastPosition = newPosition;
		}
	}

	/**
	 * тянем за нижний правый
	 **************************************************/
	_this.dright_onMove = function (event) {
		let x = event.data.global.x / window.innerWidth;
		if (x < 0 || x > 1.0) return;
		let y = event.data.global.y / window.innerHeight;
		if (y < 0 || y > 1.0) return;
		if (this.lastPosition) {
			let newPosition = {//event.data.getLocalPosition(this.parent);
				x: x * 16384,
				y: y * 16384
			};
			_this.centerWidth += (newPosition.x - this.lastPosition.x);		// центральный
																			// правый
			_this.centerHeight += (newPosition.y - this.lastPosition.y);	// нижний
																			// центральный
			this.lastPosition = newPosition;
		}
	}

	/**
	 * тянем за верхний центральный
	 **************************************************/
	_this.top_onMove = function (event) {
		let x = event.data.global.x / window.innerWidth;
		if (x < 0 || x > 1.0) return;
		let y = event.data.global.y / window.innerHeight;
		if (y < 0 || y > 1.0) return;
		if (this.lastPosition) {
			let newPosition = {//event.data.getLocalPosition(this.parent);
				x: x * 16384,
				y: y * 16384
			};
			_this.centerHeight += (this.lastPosition.y - newPosition.y);
			_this.y += (newPosition.y - this.lastPosition.y);
			this.lastPosition = newPosition;
		}
	}

	/**
	 * тянем за нижний центральный
	 **************************************************/
	_this.down_onMove = function (event) {
		let x = event.data.global.x / window.innerWidth;
		if (x < 0 || x > 1.0) return;
		let y = event.data.global.y / window.innerHeight;
		if (y < 0 || y > 1.0) return;
		if (this.lastPosition) {
			let newPosition = {//event.data.getLocalPosition(this.parent);
				x: x * 16384,
				y: y * 16384
			};
			_this.centerHeight += (newPosition.y - this.lastPosition.y);
			this.lastPosition = newPosition;
		}
	}

	/**
	 * схватить элемент
	 **************************************************/
	_this._onDragStart = function(event) {
		//this.data = event.data;
		let x = event.data.global.x / window.innerWidth;
		if (x < 0 || x > 1.0) return;
		let y = event.data.global.y / window.innerHeight;
		if (y < 0 || y > 1.0) return;
		_this.container.alpha = 0.6;
		this.lastPosition = {//event.data.getLocalPosition(this.parent);
			x: x * 16384,
			y: y * 16384
		};
	}

	/**
	 * отпустить элемент
	 **************************************************/
	_this._onDragEnd = function() {
		//this.data = null;
		_this.container.alpha = 1.0;
		this.lastPosition = null;
	}

	/**
	 * схватить заголовок
	 **************************************************/
	_this.header_onDragStart = function (event) {
		//this.data = event.data;
		let x = event.data.global.x / window.innerWidth;
		if (x < 0 || x > 1.0) return;
		let y = event.data.global.y / window.innerHeight;
		if (y < 0 || y > 1.0) return;
		_this.container.alpha = 0.6;
		this.lastPosition = {//event.data.getLocalPosition(this.parent);
			x: x * 16384,
			y: y * 16384
		};
		//console.log(`DragStart(${this.lastPosition.x} y:${this.lastPosition.y})`);

		// Set the pivot point to the new position
//		this.parent.pivot.set(this.lastPosition.x, this.lastPosition.y);

		// update the new position of the sprite to the position obtained through 
		// the global data. This ensures the position lines up with the location of 
		// the mouse on the screen. I'm not certain why, but this is necessary. 
//		this.parent.position.set(this.data.global.x, this.data.global.y);
	}

	/**
	 * отпустить заголовок
	 **************************************************/
	_this.header_onDragEnd = function() {
		//console.log(`DragEnd(${event.data.global.x} y:${event.data.global.y})`);
		//this.data = null;
		_this.container.alpha = 1.0;
		this.lastPosition = null;
	}

	/**
	 * тянем за заголовок
	 **************************************************/
	_this.header_onDragMove = function (event) {
		let x = event.data.global.x / window.innerWidth;
		if (x < 0 || x > 1.0) return;
		let y = event.data.global.y / window.innerHeight;
		if (y < 0 || y > 1.0) return;

		if (this.lastPosition)  {
			let newPosition = {
				x: x * 16384,
				y: y * 16383
			};
			_this.x += (newPosition.x - this.lastPosition.x);
			_this.y += (newPosition.y - this.lastPosition.y);
			_this.container.position.x += (newPosition.x - this.lastPosition.x);
			_this.container.position.y += (newPosition.y - this.lastPosition.y);
			this.lastPosition = newPosition;
		}
	}

	/**************************************************
	 * Тянем - конец
	 **************************************************/
} // Modalwin

/**
 * 
 * http://somov.inf.ua/library/pixijs/index.html?Newtopic8.html
 * 
 * https://www.html5gamedevs.com/topic/23690-confused-by-dragging-example-what-is-the-argument-passed-to-ondragstart/
 * 
 * <pre>
 *        A             E               B
 *    +--------+------------------+--------+
 *  C |    1   |        2         |   3    |
 *    +--------+------------------+--------+
 *  F |    4   |        5         |   6    |
 *    +--------+------------------+--------+
 *  D |    7   |        8         |   9    |
 *    +--------+------------------+--------+
 * </pre>
 */

/**
 **************************************************/
function Mainwin(centerWidth, centerHeight, leftWidth, topHeight, rightWidth, bottomHeight) {

	var _this = this;

	_this.container = new PIXI.Container();

	// size of the center vertical bar (E)
	_this.centerWidth = typeof centerWidth !== 'undefined' ? centerWidth : 16384 - 60 - 60;
	// size of the center horizontal bar (F)
	_this.centerHeight = typeof centerHeight !== 'undefined' ? centerHeight : 16384 - 120 - 120;
	// size of the left vertical bar (A)
	_this.leftWidth = typeof leftWidth !== 'undefined' ? leftWidth : 60;
	// size of the right vertical bar (B)
	_this.rightWidth = typeof rightWidth !== 'undefined' ? rightWidth : 60;
	// size of the top horizontal bar (C)
	_this.topHeight = typeof topHeight !== 'undefined' ? topHeight : 120;
	// size of the bottom horizontal bar (D)
	_this.bottomHeight = typeof bottomHeight !== 'undefined' ? bottomHeight : 120;

	_this.tleft  = new PIXI.Graphics();	// 1
	_this.top    = new PIXI.Graphics();	// 2
	_this.tright = new PIXI.Graphics();	// 3
	_this.left   = new PIXI.Graphics();	// 4

	_this.center = new PIXI.Graphics();	// 5

	_this.right  = new PIXI.Graphics();	// 6
	_this.dleft  = new PIXI.Graphics();	// 7
	_this.down   = new PIXI.Graphics();	// 8
	_this.dright = new PIXI.Graphics();	// 9

	_this.header = new PIXI.Graphics();	// 10

	_this.x = 0;
	_this.y = 0;
	_this.w = _this.leftWidth + _this.centerWidth + _this.rightWidth;
	_this.h = _this.topHeight + _this.centerHeight + _this.bottomHeight;

//	_this.str_title = 'Diagramm Title';

	_this.bgcolor = 0x000000;
	_this.paper = [];

	/***************************************************************************
	 **************************************************************************/
	_this.setPaper = function(paper) {
		_this.paper = paper;
	}

	/***************************************************************************
	 **************************************************************************/
	_this.setParam = function(diag, dispx, dispy, bgcolor, paper) {
//		_this.str_title = diag;

		_this.x = dispx;
		_this.y = dispy;

		_this.bgcolor = bgcolor;
		_this.paper = paper;
	}

	/***************************************************************************
	 * Удаляет с экрана окно управления
	 **************************************************************************/
	_this.Delete = function() {
		_this.paper = [];
		_this.Hide();
	}

	/**
	 **************************************************/
	_this.Open = function() {
		_this.container.children.forEach(function(data) {
			if (data.isSprite) {
				data.destroy({ children: true, texture: true, baseTexture: true });
			} else {
				data.clear();
				data.geometry.dispose();
			}
			//data.removeChildren(); не применяй - не работает
			_this.container.parent.removeChild(data);
		});
		_this.container.removeChildren();

		_this.container.position.x = _this.x;
		_this.container.position.y = _this.y;

		_this.window_frames();
		_this.window_center();
	}

	/**
	 **************************************************/
	_this.Hide = function() {

		// Очищаем графику, нарисованную для всех графических объектов рамки окна
		_this.tleft.clear();	// верхний левый
		_this.top.clear();		// верхний центральный
		_this.tright.clear();	// верхний правый

		_this.header.clear();	// заголовок

		_this.left.clear();		// центральный левый
		_this.right.clear();	// центральный правый

		_this.dleft.clear();	// нижний левый
		_this.down.clear();		// нижний центральный
		_this.dright.clear();	// нижний правый

		_this.center.clear();

		_this.container.children.forEach(function(data) {
			if (data.isSprite) {
				data.destroy({ children: true, texture: true, baseTexture: true });
			} else {
				data.clear();
				data.geometry.dispose();
			}
			data.removeChildren();
			_this.container.parent.removeChild(data);
		});
		_this.container.removeChildren();
	}

	/**
	 **************************************************/
	_this.window_frames = function() {

		// Очищаем графику, нарисованную для всех графических объектов рамки окна
		_this.tleft.clear();	// верхний левый
		_this.top.clear();		// верхний центральный
		_this.tright.clear();	// верхний правый

		_this.header.clear();	// заголовок

		_this.left.clear();		// центральный левый
		_this.right.clear();	// центральный правый

		_this.dleft.clear();	// нижний левый
		_this.down.clear();		// нижний центральный
		_this.dright.clear();	// нижний правый

		// верхний левый
		// ======================================================================
		_this.tleft.clear();
		_this.tleft.beginFill(BorderColor, 1);
		_this.tleft.drawRect(0, 0, _this.leftWidth, _this.topHeight);
		_this.tleft.endFill();
		_this.container.addChild(_this.tleft);

		// верхний центральный
		// ======================================================================
		_this.top.beginFill(BorderColor, 1);
		_this.top.drawRect(_this.leftWidth, 0, _this.centerWidth, _this.topHeight);
		_this.top.endFill();
		_this.container.addChild(_this.top);

		// верхний правый
		// ======================================================================
		_this.tright.beginFill(BorderColor, 1);
		_this.tright.drawRect(_this.leftWidth + _this.centerWidth - (_this.leftWidth), 0, _this.rightWidth + (_this.leftWidth), _this.topHeight);
		_this.tright.endFill();
		_this.container.addChild(_this.tright);

		// заголовок
		// ======================================================================
		_this.header.beginFill(BorderColor, 1);

		_this.header.drawRect(
				_this.leftWidth, _this.bottomHeight,
				_this.rightWidth + _this.centerWidth - _this.leftWidth, _this.topHeight - _this.bottomHeight * 2);

		_this.header.endFill();
		_this.container.addChild(_this.header);

		// центральный левый
		// ======================================================================
		_this.left.beginFill(BorderColor, 1);
		_this.left.drawRect(0, _this.topHeight, _this.leftWidth, _this.centerHeight);
		_this.left.endFill();
		_this.container.addChild(_this.left);

		// центральный правый
		// ======================================================================
		_this.right.beginFill(BorderColor, 1);
		_this.right.drawRect(_this.leftWidth + _this.centerWidth, _this.topHeight, _this.rightWidth, _this.centerHeight);
		_this.right.endFill();
		_this.container.addChild(_this.right);

		// нижний левый
		// ======================================================================
		_this.dleft.beginFill(BorderColor, 1);
		_this.dleft.drawRect(0, _this.topHeight + _this.centerHeight, _this.leftWidth, _this.bottomHeight);
		_this.dleft.endFill();
		_this.container.addChild(_this.dleft);

		// нижний центральный
		// ======================================================================
		_this.down.beginFill(BorderColor, 1);
		_this.down.drawRect(_this.leftWidth,  _this.topHeight + _this.centerHeight, _this.centerWidth, _this.bottomHeight);
		_this.down.endFill();
		_this.container.addChild(_this.down);

		// нижний правый
		// ======================================================================
		_this.dright.beginFill(BorderColor, 1);
		_this.dright.drawRect(_this.leftWidth + _this.centerWidth, _this.topHeight + _this.centerHeight, _this.rightWidth, _this.bottomHeight);
		_this.dright.endFill();
		_this.container.addChild(_this.dright);

	} // window_frames

	/**************************************************
	 * Отрисовка центра окна
	 **************************************************/
	_this.window_center = function() {

		// Очищаем графику, нарисованную для всех графических объектов центральной цасти окна
		_this.center.children.forEach(function(data) {
			if (data.isSprite) {
				data.destroy({ children: true, texture: true, baseTexture: true });
			} else {
				data.clear();
				data.geometry.dispose();
			}
			data.removeChildren();
		});
		_this.center.removeChildren();
		_this.center.clear();	// все секции центра окна

		// центральный
		// ======================================================================
		_this.center.beginFill(_this.bgcolor, 1);
		_this.center.drawRect(_this.leftWidth, _this.topHeight, _this.centerWidth, _this.centerHeight);
		_this.center.endFill();
		_this.center.interactive = true;

		let shapeMatrix = Wdpf_matrix();
		shapeMatrix.translate(_this.leftWidth, _this.topHeight);
		shapeMatrix.scale(_this.centerWidth/(16384), _this.centerHeight/(16384), 0, 0);
		let pixiShapeMatrix = new PIXI.Matrix(shapeMatrix.a, shapeMatrix.b,
				shapeMatrix.c, shapeMatrix.d, shapeMatrix.e, shapeMatrix.f);

		for(let el in _this.paper) {
			let shape = _this.paper[ el ];
//			shape.transform.setFromMatrix(pixiShapeMatrix);	ломает шэйпы !!!
			_this.center.addChild(shape);
		}

		_this.center.transform.setFromMatrix(pixiShapeMatrix);	// не ломает шэйпы

		_this.container.addChild(_this.center);

	} // window_center

} // Mainwin

/**
 * 
 * http://somov.inf.ua/library/pixijs/index.html?Newtopic8.html
 * 
 * https://www.html5gamedevs.com/topic/23690-confused-by-dragging-example-what-is-the-argument-passed-to-ondragstart/
 * 
 * <pre>
 *        A             E               B
 *    +--------+------------------+--------+
 *  C |    1   |        2         |   3    |
 *    +--------+------------------+--------+
 *  F |    4   |        5         |   6    |
 *    +--------+------------------+--------+
 *  D |    7   |        8         |   9    |
 *    +--------+------------------+--------+
 * </pre>
 */

var AlertBorderColor = 0xFF0000; 
var AlertHeaderColor = 0xC0C0C0;

function AlertWin(centerWidth, centerHeight, leftWidth, topHeight, rightWidth, bottomHeight) {

	var _this = this;

	_this.container = new PIXI.Container();
	// size of the center vertical bar (E)
	_this.centerWidth = typeof centerWidth !== 'undefined' ? centerWidth : 6384;
	// size of the center horizontal bar (F)
	_this.centerHeight = typeof centerHeight !== 'undefined' ? centerHeight : 6384;
	// size of the left vertical bar (A)
	_this.leftWidth = typeof leftWidth !== 'undefined' ? leftWidth : 60;
	// size of the right vertical bar (B)
	_this.rightWidth = typeof rightWidth !== 'undefined' ? rightWidth : 60;
	// size of the top horizontal bar (C)
	_this.topHeight = typeof topHeight !== 'undefined' ? topHeight : 900;
	// size of the bottom horizontal bar (D)
	_this.bottomHeight = typeof bottomHeight !== 'undefined' ? bottomHeight : 120;

	_this.tleft  = new PIXI.Graphics();	// 1
	_this.top    = new PIXI.Graphics();	// 2
	_this.tright = new PIXI.Graphics();	// 3
	_this.left   = new PIXI.Graphics();	// 4

	_this.center = new PIXI.Graphics();	// 5

	_this.right  = new PIXI.Graphics();	// 6
	_this.dleft  = new PIXI.Graphics();	// 7
	_this.down   = new PIXI.Graphics();	// 8
	_this.dright = new PIXI.Graphics();	// 9

	_this.header = new PIXI.Graphics();	// 10
	_this.close  = new PIXI.Graphics();	// 11
	_this.title  = new PIXI.Graphics();	// 12

	_this.x = 5000;
	_this.y = 5000;
	_this.w = _this.leftWidth + _this.centerWidth + _this.rightWidth;
	_this.h = _this.topHeight + _this.centerHeight + _this.bottomHeight;

	_this.str_title = '     Invalid signal entered';

	_this.bgcolor = 0x000000;
	_this.paper = [];

	_this.cur_val = 0;
	_this.min_val = 0;
	_this.max_val = 0;

	_this.txt_1  = new PIXI.Graphics();	// 13
	_this.txt_2  = new PIXI.Graphics();	// 14
	_this.txt_3  = new PIXI.Graphics();	// 15

	/**
	 **************************************************/
	_this.Open = function(cur_val, min_val, max_val) {

		_this.cur_val = cur_val;
		_this.min_val = min_val;
		_this.max_val = max_val;

		//_this.container.children.forEach(data => {
		_this.container.children.forEach(function(data) {
			if (data.isSprite) {
				data.destroy({ children: true, texture: true, baseTexture: true });
			} else {
				data.clear();
				data.geometry.dispose();
			}
			//data.removeChildren(); не применяй - не работает
			_this.container.parent.removeChild(data);
		});
		_this.container.removeChildren();

		_this.container.position.x = _this.x;
		_this.container.position.y = _this.y;

		_this.window_frames();
	}

	/**
	 **************************************************/
	_this.Hide = function() {

		// Очищаем графику, нарисованную для всех графических объектов рамки окна
		_this.tleft.clear();	// верхний левый
		_this.top.clear();		// верхний центральный
		_this.tright.clear();	// верхний правый

		_this.header.clear();	// заголовок
		_this.title.clear();	// заголовок
		_this.close.clear();	// Close Button

		_this.left.clear();		// центральный левый
		_this.right.clear();	// центральный правый

		_this.dleft.clear();	// нижний левый
		_this.down.clear();		// нижний центральный
		_this.dright.clear();	// нижний правый

		_this.center.clear();

		//_this.container.children.forEach(data => {
		_this.container.children.forEach(function(data) {
			if (data.isSprite) {
				data.destroy({ children: true, texture: true, baseTexture: true });
			} else {
				data.clear();
				data.geometry.dispose();
			}
			data.removeChildren();
			_this.container.parent.removeChild(data);
		});
		_this.container.removeChildren();
	}

	/**
	 **************************************************/
	_this.window_frames = function() {

		// Очищаем графику, нарисованную для всех графических объектов рамки окна
		_this.tleft.clear();	// верхний левый
		_this.top.clear();		// верхний центральный
		_this.tright.clear();	// верхний правый

		_this.header.clear();	// заголовок
		_this.title.clear();	// заголовок
		_this.close.clear();	// Close Button

		_this.left.clear();		// центральный левый
		_this.right.clear();	// центральный правый

		_this.dleft.clear();	// нижний левый
		_this.down.clear();		// нижний центральный
		_this.dright.clear();	// нижний правый

		// верхний левый
		// ======================================================================
		_this.tleft.clear();
		_this.tleft.beginFill(AlertBorderColor, 1);
		_this.tleft.drawRect(0, 0, _this.leftWidth, _this.topHeight);
		_this.tleft.endFill();
		_this.container.addChild(_this.tleft);

		// верхний центральный
		// ======================================================================
		_this.top.beginFill(AlertBorderColor, 1);
		_this.top.drawRect(_this.leftWidth, 0, _this.centerWidth, _this.topHeight);
		_this.top.endFill();
		_this.container.addChild(_this.top);

		// верхний правый
		// ======================================================================
		_this.tright.beginFill(AlertBorderColor, 1);
		_this.tright.drawRect(_this.leftWidth + _this.centerWidth - (_this.leftWidth), 0, _this.rightWidth + (_this.leftWidth), _this.topHeight);
		_this.tright.endFill();
		_this.container.addChild(_this.tright);

		// заголовок
		// ======================================================================
		_this.header.beginFill(AlertHeaderColor, 1);
		_this.header.drawRect(
				_this.leftWidth, _this.bottomHeight,
				_this.rightWidth + _this.centerWidth - _this.leftWidth, _this.topHeight - _this.bottomHeight * 2);
		_this.header.endFill();
		_this.header.interactive = true;

		_this.container.addChild(_this.header);

		// Title Text
		// ======================================================================
		Gcolor(0x000000,0x000000,0x000000,0);
		_this.title = smpl_text(
				_this.leftWidth, _this.bottomHeight,
				"HORZ", -1, -1,
				_this.str_title,
				"VECTOR", null,
				192, _this.topHeight - _this.bottomHeight * 1.6,
				0, false);
		_this.title.interactive = true;
		_this.container.addChild(_this.title);

		// Close Button
		// ======================================================================
		let x = _this.centerWidth - (_this.leftWidth + _this.rightWidth) * 2.0;
		let y = _this.topHeight / 4.2;
		let w = (_this.leftWidth + _this.rightWidth) * 2;
		let h = _this.topHeight / 2;
		_this.close.beginFill(AlertBorderColor,1).drawRoundedRect(x,y,w,h,(Math.min.apply(null,[w,h])*0.25)).endFill();
		_this.close.lineStyle(32,0x000,1).moveTo(x+50,y+50).lineTo(x+w-50,y+h-50);
		_this.close.lineStyle(32,0x000,1).moveTo(x+50,y+h-50).lineTo(x+w-50,y+50);
		_this.close.interactive = true;
		_this.close.buttonMode = true;
		_this.close.hitArea = new PIXI.Rectangle(x, y, w, h);
		//_this.close.click = function(ev) {
		_this.close.mouseup = function(ev) {
			/*console.log("Close Button clicked");*/
			/*console.log("Close Button mouseup");*/
			_this.Hide();
		}
		_this.container.addChild(_this.close);

		// центральный левый
		// ======================================================================
		_this.left.beginFill(AlertBorderColor, 1);
		_this.left.drawRect(0, _this.topHeight, _this.leftWidth, _this.centerHeight);
		_this.left.endFill();
		_this.container.addChild(_this.left);

		// центральный правый
		// ======================================================================
		_this.right.beginFill(AlertBorderColor, 1);
		_this.right.drawRect(_this.leftWidth + _this.centerWidth, _this.topHeight, _this.rightWidth, _this.centerHeight);
		_this.right.endFill();
		_this.container.addChild(_this.right);

		// нижний левый
		// ======================================================================
		_this.dleft.beginFill(AlertBorderColor, 1);
		_this.dleft.drawRect(0, _this.topHeight + _this.centerHeight, _this.leftWidth, _this.bottomHeight);
		_this.dleft.endFill();
		_this.container.addChild(_this.dleft);

		// нижний центральный
		// ======================================================================
		_this.down.beginFill(AlertBorderColor, 1);
		_this.down.drawRect(_this.leftWidth,  _this.topHeight + _this.centerHeight, _this.centerWidth, _this.bottomHeight);
		_this.down.endFill();
		_this.container.addChild(_this.down);

		// нижний правый
		// ======================================================================
		_this.dright.beginFill(AlertBorderColor, 1);
		_this.dright.drawRect(_this.leftWidth + _this.centerWidth, _this.topHeight + _this.centerHeight, _this.rightWidth, _this.bottomHeight);
		_this.dright.endFill();
		_this.container.addChild(_this.dright);

		// центральный - отрисовка центра окна
		// ======================================================================
		_this.center.beginFill(AlertHeaderColor, 1);

		_this.center.drawRect(_this.leftWidth, _this.topHeight, _this.centerWidth, _this.centerHeight);
		_this.center.endFill();
		_this.center.interactive = true;

		_this.container.addChild(_this.center);

		// Title Text
		// ======================================================================
		Gcolor(0x000000,0x000000,0x000000,0);

		_this.txt_1 = smpl_text(_this.leftWidth*2, _this.topHeight*3, "HORZ", -1, -1,
				"   The entered value [" + _this.cur_val + "]",
				"VECTOR", null, 192, _this.topHeight - _this.bottomHeight * 1.6, 0, false);
		_this.container.addChild(_this.txt_1);

		_this.txt_2 = smpl_text(_this.leftWidth*2, _this.topHeight*4, "HORZ", -1, -1,
				"   outside of valid range:",
				"VECTOR", null, 192, _this.topHeight - _this.bottomHeight * 1.6, 0, false);
		_this.container.addChild(_this.txt_2);

		_this.txt_3 = smpl_text(_this.leftWidth*2, _this.topHeight*5, "HORZ", -1, -1,
				"   min [" + _this.min_val + "] ....... max [" + _this.max_val + "]",
				"VECTOR", null, 192, _this.topHeight - _this.bottomHeight * 1.6, 0, false);
		_this.container.addChild(_this.txt_3);

	} // window_frames

} // AlertWin

/**
 * @description Моноширинный шрифт Ovation for Solaris.
 * 
 * Это шрифт, в котором все знаки (точнее, кегельные площадки знаков) имеют
 * одинаковую ширину.
 * 
 * Размер кегельной площадки шрифта Ovation for Solaris = 66 х 120.
 */

/**
 * @description Моноширинный шрифт Ovation for Solaris.
 * 
 * Это шрифт, в котором все знаки (точнее, кегельные площадки знаков) имеют
 * одинаковую ширину.
 */

var glyphs = {
		" " : { "p" : "M 0 0 L 0 0"},
		"!" : { "p" : "M 25 110 25 50M 25 40 25 30"},
		"\"" : { "p" : "M 14 110 14 90M 34 110 34 90"},
		"#" : { "p" : "M 20 100 10 40M 40 100 30 40M 50 80 10 80M 40 60 1 60"},
		"$" : { "p" : "M 50 100 40 110 10 110 1 100 1 80 10 70 40 70 50 60 50 40 40 30 10 30 1 40M 25 116 25 24"},
		"%" : { "p" : "M 1 100 1 90 10 80 20 80 30 90 30 100 20 110 10 110 1 100M 21 50 21 40 30 30 40 30 50 40 50 50 40 60 30 60 21 50M 50 110 1 30"},
		"&" : { "p" : "M 50 30 41 40 10 90 10 100 15 110 25 110 30 100 30 90 25 80 1 60 1 40 10 30 35 30 50 50"},
		"'" : { "p" : "M 25 110 25 95 15 80"},
		"(" : { "p" : "M 21 110 1 90 1 50 21 30"},
		")" : { "p" : "M 1 110 21 90 21 50 1 30"},
		"*" : { "p" : "M 21 100 21 40M 1 90 41 50M 41 90 1 50"},
		"+" : { "p" : "M 25 90 25 40M 49 65 1 65"},
		"," : { "p" : "M 26 30 26 35 23 35 23 30 23 20 26 30 16 10"},
		"-" : { "p" : "M 1 60 41 60"},
		"." : { "p" : "M 23 30 23 35 27 35 27 30 23 30"},
		"\/" : { "p" : "M 42 110 2 30"},
		"0" : { "p" : "M 11 30 1 40 1 100 11 110 31 110 41 100 41 40 31 30 11 30"},
		"1" : { "p" : "M 2 100 17 110 17 30M 32 30 2 30"},
		"2" : { "p" : "M 6 100 16 110 36 110 46 100 46 86 36 75 1 40 1 30 46 30"},
		"3" : { "p" : "M 1 100 11 110 31 110 41 100 41 80 31 70 41 60 41 40 31 30 11 30 1 40M 31 70 11 70"},
		"4" : { "p" : "M 40 30 40 110 4 60 50 60"},
		"5" : { "p" : "M 42 109 2 109 2 75 32 75 42 65 42 40 32 30 12 30 2 40"},
		"6" : { "p" : "M 50 100 40 110 10 110 1 100 1 80 1 40 10 30 40 30 50 40 50 60 40 70 10 70 1 60"},
		"7" : { "p" : "M 1 110 50 110 20 30"},
		"8" : { "p" : "M 1 100 10 110 40 110 50 100 50 80 40 70 50 60 50 40 40 30 10 30 1 40 1 60 10 70 1 80 1 100M 10 70 40 70"},
		"9" : { "p" : "M 1 40 11 30 41 30 50 40 50 60 50 100 41 110 11 110 1 100 1 80 11 70 41 70 50 80"},
		":" : { "p" : "M 23 70 23 75 27 75 27 70 23 70M 23 40 23 45 27 45 27 40 23 40"},
		";" : { "p" : "M 27 30 27 35 23 35 23 30 27 30M 26 30 23 20 16 10"},
		"<" : { "p" : "M 50 100 1 65 50 30"},
		"=" : { "p" : "M 1 50 41 50M 1 80 41 80"},
		">" : { "p" : "M 1 100 50 65 1 30"},
		"?" : { "p" : "M 1 100 11 110 31 110 41 100 41 80 21 70 21 48M 21 39 21 30"},
		"@" : { "p" : "M 50 60 50 80 40 90 30 90 20 80 20 60 30 50 40 50M 50 80 50 90 40 100 10 100 1 90 1 40 10 30 40 30 50 40"},
//		"A" : { "p" : "M 1 30 25 109 50 30M 11 64 39 64"},
		"A" : { "p" : "M 1 30 L 24 109 L 25 109 L 50 30 M 11 64 L 39 64"},
		"B" : { "p" : "M 1 30 1 110 40 110 50 100 50 80 41 70 50 60 50 40 40 30 1 30M 41 70 1 70"},
		"C" : { "p" : "M 50 40 40 30 10 30 1 40 1 100 10 110 40 110 50 100"},
		"D" : { "p" : "M 1 30 1 110 40 110 50 100 50 80 50 80 50 60 50 40 40 30 1 30"},
		"E" : { "p" : "M 50 30 1 30 1 110 50 110M 40 70 1 70"},
		"F" : { "p" : "M 50 110 1 110 1 30M 40 70 1 70"},
		"G" : { "p" : "M 50 100 40 110 10 110 1 100 1 40 10 30 50 30 50 60 30 60"},
		"H" : { "p" : "M 1 110 1 30M 50 110 50 30M 50 70 1 70"},
		"I" : { "p" : "M 21 110 21 30M 1 30 41 30M 1 110 41 110"},
		"J" : { "p" : "M 50 110 19 110M 40 110 40 40 30 30 10 30 0 40"},
		"K" : { "p" : "M 1 110 1 30M 40 110 2 70 40 30"},
		"L" : { "p" : "M 1 110 1 30 50 30"},
//		"M" : { "p" : "M 1 30 1 109 25 32 50 109 50 30"},
//		"M" : { "p" : "M 1 30 1 109 2 109 25 32 26 32 49 109 50 109 50 30"},
		"M" : { "p" : "M 1 30 L 1 109 L 2 109 L 25 42 L 26 42 L 49 109 L 50 109 L 50 30"},

//		"N" : { "p" : "M 1 30 1 108 50 32 50 110"},
		"N" : { "p" : "M 1 30 1 108 2 108 49 32 50 32 50 110"},
		"O" : { "p" : "M 1 40 1 100 10 110 40 110 50 100 50 40 40 30 10 30 1 40"},
		"P" : { "p" : "M 1 30 1 110 40 110 50 100 50 80 40 70 1 70"},
		"Q" : { "p" : "M 1 40 1 100 10 110 40 110 50 100 50 40 40 30 10 30 1 40M 30 30 35 20 50 11"},
		"R" : { "p" : "M 1 30 1 110 40 110 50 100 50 80 40 70 1 70M 30 70 50 30"},
		"S" : { "p" : "M 1 40 10 30 40 30 50 40 50 60 40 70 10 70 1 80 1 100 10 110 40 110 50 100"},
		"T" : { "p" : "M 1 110 50 110M 25 110 25 30"},
		"U" : { "p" : "M 1 110 1 40 10 30 40 30 50 40 50 110"},
//		"V" : { "p" : "M 1 110 25 31 50 110"},
		"V" : { "p" : "M 1 110 25 30 26 30 50 110"},

//		"W" : { "p" : "M 1 110 15 31 25 100 35 31 50 110"},
//		"W" : { "p" : "M 1 110 10 31 17 31 25 100 26 100 33 31 40 31 50 110"},
//		"W" : { "p" : "M 1 110 2 31 25 31 25 100 26 100 26 31 49 31 50 110"},
		"W" : { "p" : "M 1 110 4 31 25 31 25 100 25 31 47 31 50 110"},

		"X" : { "p" : "M 1 30 50 110M 1 110 50 30"},
		"Y" : { "p" : "M 1 110 25 70 49 110M 25 70 25 30"},
		"Z" : { "p" : "M 1 110 49 110 1 30 49 30"},
		"[" : { "p" : "M 21 110 1 110 1 30 21 30"},
		"\\" : { "p" : "M 1 110 41 30"},
		"]" : { "p" : "M 1 110 21 110 21 30 1 30"},
		"^" : { "p" : "M 1 90 21 110 41 90"},
		"_" : { "p" : "M 3 30 50 30"},
		"`" : { "p" : "M 10 80 10 95 20 110M 13 80 13 85 9 85 9 80 13 80"},
		"a" : { "p" : "M 30 35 25 30 6 30 1 35 1 49 6 54 30 54M 35 30 30 35 30 65 25 70 6 70 1 65"},
		"b" : { "p" : "M 2 100 2 30M 2 65 10 70 29 70 35 65 35 35 29 30 10 30 2 35"},
		"c" : { "p" : "M 30 65 22 70 9 70 1 60 1 40 9 30 22 30 30 35"},
		"d" : { "p" : "M 30 30 30 100M 30 65 25 70 6 70 1 65 1 35 6 30 25 30 30 35"},
		"e" : { "p" : "M 1 52 30 52 30 64 22 70 9 70 1 64 1 35 9 30 22 30 30 35"},
		"f" : { "p" : "M 11 30 11 90 15 95 31 95M 1 70 26 70"},
		"g" : { "p" : "M 30 65 25 70 6 70 1 65 1 35 6 30 25 30 30 35M 30 15 30 50 30 65M 1 9 6 5 25 5 30 15"},
		"h" : { "p" : "M 3 110 3 30M 3 65 10 70 30 70 35 65 35 30"},
		"i" : { "p" : "M 23 80 23 85 27 85 27 80M 25 30 25 70 19 70"},
		"j" : { "p" : "M 23 80 23 85 27 85 27 80M 25 30 25 70 19 70M 19 70 25 70 25 20 20 15 15 15 10 20"},
		"k" : { "p" : "M 2 100 2 30M 20 67 2 50 20 30"},
		"l" : { "p" : "M 1 100 12 100 12 30"},
		"m" : { "p" : "M 1 30 1 61 7 70 12 70 17 65 17 30M 1 47 1 70M 17 30 17 61 23 70 28 70 33 65 33 30"},
		"n" : { "p" : "M 1 30 1 60 7 70 23 70 30 65 30 30M 1 57 1 70"},
		"o" : { "p" : "M 6 30 1 34 1 65 6 70 25 70 30 65 30 34 25 30 6 30"},
		"p" : { "p" : "M 1 70 1 2M 1 33 6 30 25 30 30 34 30 65 25 70 6 70 1 65"},
		"q" : { "p" : "M 30 70 30 2M 1 33 6 30 25 30 30 34 30 65 25 70 6 70 1 65 1 33"},
		"r" : { "p" : "M 1 30 1 70M 1 62 12 70 22 70 30 66"},
		"s" : { "p" : "M 1 35 10 30 20 30 30 35 30 45 20 50 10 50 1 55 1 65 10 70 20 70 30 65"},
		"t" : { "p" : "M 11 96 11 35 16 30 22 30 26 35M 1 70 21 70"},
		"u" : { "p" : "M 30 39 30 30M 30 70 30 39 25 30 6 30 1 36 1 70"},
		"v" : { "p" : "M 1 70 16 31 30 70"},
		"w" : { "p" : "M 1 70 10 31 19 70M 37 70 28 31 19 70"},
		"x" : { "p" : "M 1 70 35 30M 35 70 1 30"},
		"y" : { "p" : "M 30 70 15 30 1 10M 1 70 15 30"},
		"z" : { "p" : "M 0 70 29 70 1 30 29 30"},
		"{" : { "p" : "M 14 111 9 111 5 106 5 74 1 70 5 66 5 35 9 29 14 29"},
		"|" : { "p" : "M 25 110 25 30"},
		"}" : { "p" : "M 1 111 6 111 10 106 10 74 14 70 10 66 10 35 6 29 1 29"},
		"~" : { "p" : "M 5 81 15 87 25 81 35 87"},
};

// ширина и высота кегельных площадок шрифтовы знаков
var glyph_w = 50;
var glyph_h = 105;

// апрош - пустое пространство между соседними шрифтовыми знаками
var letterspace = 20;

/*******************************************************************************
 */
String.prototype.leftJustify = function( length, char ) {
	let fill = [];
	while ( fill.length + this.length < length ) {
		fill[fill.length] = char;
	}
	return fill.join('') + this;
};

/*******************************************************************************
 */
String.prototype.rightJustify = function( length, char ) {
	let fill = [];
	while ( fill.length + this.length < length ) {
		fill[fill.length] = char;
	}
	return this + fill.join('');
};

/*******************************************************************************
 */
String.prototype.centerJustify = function( length, char ) {
	let i=0;
	let str= this;
	let toggle= true;
	while ( i + this.length < length ) {
		i++;
		if(toggle)
			str = str+ char;
		else
			str = char+str;
		toggle = !toggle;
	}
	return str;
};

/*******************************************************************************
 * Флаг выравнивания строки:
 * 
 * <pre>
 *   0 - выравнивание по левому краю
 *   1 - выравнивание по правому краю
 *   2 - выравнивание по центру
 * </pre>
 */
function Justify( justification, length, str ) {
	switch (justification) {
	case 0:
		return str.leftJustify( length, ' ' );
		break;
	case 1:
		return str.rightJustify( length, ' ' );
		break;
	case 2:
		return str.centerJustify( length, ' ' );
		break;
	}
	return str;
};

/*******************************************************************************
 * @description Преобразовать текст в путь SVG, используя моноширный шрифт
 *              Ovation for Solaris
 */
function GetPath(text, orientation) {

	let char;
	let glyph;

	// сдвиг по X и Y для каждого последующего знака
	let shift_x = 0;
	let shift_y = 0;

	let letters = text.split(""); // массив знаков текста
	let notfirst = false; // не первый знак текста
	let path = ""; // результирующий путь текста

	for (let i = 0, ii = letters.length; i < ii; i++) {
		char = letters[i];
		glyph = glyphs[letters[i]];
		switch (orientation) {
		case "HORZ":
			if (notfirst) { // не первый знак
				if (letters[i - 1] == '.') {
					shift_x += glyph_w / 2.0 + letterspace;
				} else {
					shift_x += glyph_w + letterspace;
				}
			}
			break;
		case "VERT":
			shift_y += notfirst ? glyph_h : 0;
			break;
		}

		notfirst = true;

		if (glyph && glyph.p) {
			path += TranslatePath(glyph.p, 1, -1, shift_x, shift_y);
		} else {
			console.error('Unknown glyph "' + char + '" in text "' + text + '"');
		}
	} // for

	return path;
};

/*******************************************************************************
 * Translate a Glyph <path> d element
 * 
 * a, b, c, d, e, f
 * 
 * scaleX, skewH, skewW, scaleY, tx, ty
 */
function TranslatePath(path, sx, sy, tx, ty) {
	var length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0};
	var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig;

	function parseValues(args) {
		var number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig;
		var numbers = args.match(number);
		return numbers ? numbers.map(Number) : [];
	};

	var data = [];
	path.replace(segment, function(_, command, args) {
		var type = command.toLowerCase();
		args = parseValues(args);

		// overloaded moveTo
		if (type == 'm' && args.length > 2) {
			data.push([command].concat(args.splice(0, 2)));
			type = 'l';
			command = command == 'm' ? 'l' : 'L';
		}

		while (true) {
			if (args.length == length[type]) {
				args.unshift(command);
				return data.push(args);
			}
			if (args.length < length[type]) throw new Error('malformed path data');
			data.push([command].concat(args.splice(0, length[type])));
		}
	});

	var translate_path = '';
	data.forEach(function(item, index, array) {
		translate_path += ' ' + item[0] + ' '
		+ (sx * item[1] + tx).toFixed(4) + ' '
		+ (sy * item[2] + ty).toFixed(4);
	});

	return translate_path;
};

/**
 * parse an svg path data string. Generates an Array of commands where each
 * command is an Array of the form `[command, arg1, arg2, ...]`
 * 
 * GlyphParse('m1 2 3 4') // => [['m',1,2],['l',3,4]]
 * 
 */
function RenderPath(t, path) {
	var length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0};
	var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig;

	function parseValues(args) {
		var number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig;
		var numbers = args.match(number);
		return numbers ? numbers.map(Number) : [];
	};

	var data = [];
	path.replace(segment, function(_, command, args) {
		var type = command.toLowerCase();
		args = parseValues(args);

		// overloaded moveTo
		if (type == 'm' && args.length > 2) {
			data.push([command].concat(args.splice(0, 2)));
			type = 'l';
			command = command == 'm' ? 'l' : 'L';
		}

		while (true) {
			if (args.length == length[type]) {
				args.unshift(command);
				return data.push(args);
			}
			if (args.length < length[type]) throw new Error('malformed path data');
			data.push([command].concat(args.splice(0, length[type])));
		}
	});

	data.forEach(function(item, index, array) {
		switch (item[0]) {
		case 'M': {
			t.moveTo(item[1], item[2]);
			break;
		}
		case 'L': {
			t.lineTo(item[1], item[2]);
			break;
		}
		default: {
			console.info('RenderPath: Draw command not supported:', item[0]);
			break;
		}
		}

	});

};

/*******************************************************************************
 * @description Рендеринг текста для комманд Графического языка Ovation
 */
function smpl_text(
		_x, _y, _orientation, _justification, _justify_chars, _text,
		_font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width, _hightlight)
{
	var gText = new PIXI.Graphics();

	// выравнивание
	var _string = Justify(_justification, _justify_chars, _text);

	// рендеринг фона каждого знакоместа, включённого в текстовую строку
	switch (_orientation) {
	case 'HORZ':
		switch (_font_type) {
		case 'BITMAP': case 'BITMAP_OVER': case 'VECTOR':
			// нет фона нет
			break;
		case 'VECTOR_OVER':
			gText.beginFill(COLOR.bg, 1);
			gText.lineStyle(1, COLOR.bg);
			gText.drawRect(_x, _y, (_vector_char_w * _string.length), (_vector_char_h));
			gText.endFill();
			break;
		} // switch _font_type
		break;
	case 'VERT':
		switch (_font_type) {
		case 'BITMAP': case 'BITMAP_OVER': case 'VECTOR':
			// нет фона нет
			break;
		case 'VECTOR_OVER':
			gText.beginFill(COLOR.bg, 1);
			gText.lineStyle(1, COLOR.bg);
			gText.drawRect(_x, _y, (_vector_char_w), (_vector_char_h * _string.length));
			gText.endFill();
			break;
		} // switch _font_type
		break;
	} // switch _orientation

	// рендеринг переднего плана каждого знакоместа, включённого в текстовую
	// строку

	// получить путь для текстовой строки
	var path = GetPath(_string, _orientation)

	// подготовка трансформации текста

	// ширина и высота кегельных площадок шрифтовы знаков
	var glyphWidth = glyph_w + letterspace;
	var glyphHeight = glyph_h;
	var sx, sy, tx, ty;

	switch (_orientation) {
	case 'HORZ':
		sx = (_vector_char_w * _string.length)/(glyphWidth * _string.length) - 0.02;
		sy = (_vector_char_h)/glyphHeight;
		tx = _x + (_vector_char_w * _string.length * 0.02);
		ty = _y + _vector_char_h + (_vector_char_h * 0.14);
		break;
	case 'VERT':
		sx = (_vector_char_w) / glyphWidth;
		sy = (_vector_char_h) / glyphHeight;
		tx = _x;
		ty = _y + _vector_char_h;
		break;
	} // switch _orientation

	// трансформировать текст
	var pathTransform = TranslatePath(path, sx, sy, tx, ty);
	// console.log("smpl_text pathTransform:", pathTransform);

	// отрисовка

	gText.lineStyle(LINEWIDTHS[_line_width]/* + 1*/, COLOR.fg, 1);
//	gText.lineStyle(18, COLOR.fg, 1);

	RenderPath(gText, pathTransform);	// Отрисовываем всю строку

	// где хайлайтер ???
	if (_hightlight === undefined) {
	} else {
		if (_hightlight) {
			var BB = gText.getBounds();
			var bbx = -22 + BB.x; // top left corner x
			var bby = -22 + BB.y; // top left corner y
			var bbw = +44 + BB.width; // width
			var bbh = +44 + BB.height; // height
			HighLighterGraphics.show(bbx, bby, bbw, bbh);
		}
	}

	return gText;

}; // smpl_text

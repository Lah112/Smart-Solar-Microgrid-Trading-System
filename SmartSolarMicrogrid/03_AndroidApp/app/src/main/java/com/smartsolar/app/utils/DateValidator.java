package com.smartsolar.app.utils;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/**
 * Validates business rules for power trading reservations (7-day window & 12-hour cancellation/update rule).
 */
public class DateValidator {

    private static final SimpleDateFormat ISO_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd", Locale.US);

    /**
     * Verifies that the reservation date is within 7 days from today.
     */
    public static boolean isWithin7Days(Date date) {
        Calendar today = Calendar.getInstance();
        today.set(Calendar.HOUR_OF_DAY, 0);
        today.set(Calendar.MINUTE, 0);
        today.set(Calendar.SECOND, 0);
        today.set(Calendar.MILLISECOND, 0);

        Calendar maxDate = Calendar.getInstance();
        maxDate.setTime(today.getTime());
        maxDate.add(Calendar.DAY_OF_YEAR, 7);

        Calendar target = Calendar.getInstance();
        target.setTime(date);
        target.set(Calendar.HOUR_OF_DAY, 0);
        target.set(Calendar.MINUTE, 0);
        target.set(Calendar.SECOND, 0);
        target.set(Calendar.MILLISECOND, 0);

        return !target.before(today) && !target.after(maxDate);
    }

    /**
     * Verifies that the modification or cancellation is at least 12 hours before slot time.
     */
    public static boolean has12HoursNotice(String dateStr, String startTimeStr) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US);
            String cleanDate = dateStr.contains("T") ? dateStr.split("T")[0] : dateStr;
            Date slotDateTime = sdf.parse(cleanDate + " " + startTimeStr);

            if (slotDateTime == null) return false;

            long diffMillis = slotDateTime.getTime() - System.currentTimeMillis();
            long hours = diffMillis / (1000 * 60 * 60);

            return hours >= 12;
        } catch (Exception e) {
            return false;
        }
    }
}

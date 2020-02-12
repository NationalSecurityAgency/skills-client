package skills.log

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.filter.AbstractMatcherFilter;
import ch.qos.logback.core.spi.FilterReply;

public class ClassNameFilter extends AbstractMatcherFilter<ILoggingEvent> {

    String loggerName;

    @Override
    public FilterReply decide(ILoggingEvent event) {
        if (!isStarted()) {
            return FilterReply.NEUTRAL;
        }

        if (event.getLoggerName().equals(loggerName)) {
            return onMatch;
        } else {
            return onMismatch;
        }
    }

    public void setClassName(String className) {
        this.loggerName = className;
    }

    @Override
    public void start() {
        if (this.loggerName != null) {
            super.start();
        }
    }
}


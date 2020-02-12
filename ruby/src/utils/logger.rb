require 'logger'
require 'singleton'

LOG_LEVEL_STRING_TO_ENUM = {
  'info' => Logger::INFO,
  'debug' => Logger::DEBUG,
  'warning' => Logger::WARN,
  'error' => Logger::ERROR
}

class Log
  include Singleton
  @__logger = nil

  def init(log_level)
    @__logger = Logger.new(STDOUT)
    @__logger.level = LOG_LEVEL_STRING_TO_ENUM[log_level]
    original_formatter = Logger::Formatter.new
    @__logger.formatter = proc { |severity, datetime, progname, msg|
      original_formatter.call(severity, datetime, progname, msg.dump)
    }
    Log.debug("logger has been initialized to level #{log_level}")
  end

  def __log
    @__logger
  end

  def self.info(msg)
    Log.instance.__log.info(msg)
  end

  def self.debug(msg)
    Log.instance.__log.debug(msg)
  end

  def self.warning(msg)
    Log.instance.__log.warn(msg)
  end

  def self.error(msg)
    Log.instance.__log.error(msg)
  end
end

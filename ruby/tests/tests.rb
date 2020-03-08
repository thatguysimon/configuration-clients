Dir[File.dirname(File.absolute_path(__FILE__)) + '/**/test_*.rb'].sort.each { |file| require file }

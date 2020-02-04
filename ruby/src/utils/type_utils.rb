# utility to converting string based values into other types
#
# @param to_type [Class]
# @param string_value [String]
# @return [Class] or throws.
def dynamic_cast(to_type, string_value)
  result =
    case to_type.name
    when 'String'
      string_value
    when 'Float'
      Float(string_value)
    when 'Integer'
      Integer(string_value)
    when 'TrueClass', 'FalseClass'
      return true if string_value.downcase == 'true'

      return false if string_value.downcase == 'false'

      raise StandardError, "Cannot convert #{string_value} to boolean!"
    else
      raise StandardError, "Unsupported type #{to_type}"
    end
  result
end

# x = dynamic_cast(Integer, "123")
# puts x

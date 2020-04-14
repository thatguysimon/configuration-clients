
defmodule Json5Reader do
  def read_file(file_path) do
    json5txt = File.read!(file_path)
    # IO.puts "json5 file content #{json5txt}"
    json = to_json(json5txt)
    # IO.puts "json file content #{json}"
    json
  end

  def to_json(json5) do
    # removing comments occupying whole line or at and of line, beginning with // 
    result = Regex.replace(~r/\/\/(:?[^\"]*)$/ms, json5, "")
    # removing multiline block comments /* block */
    result = Regex.replace(~r/(\/\*(?!(\*\/)).*?\*\/)/ms, result, "")

    # IO.puts "json file after to_json:::: \n #{result}"
    result
  end

end
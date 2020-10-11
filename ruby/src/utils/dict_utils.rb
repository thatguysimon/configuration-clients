def flatten_dict(hash)
  hash.each_with_object({}) do |(k, v), h|
    if v.is_a? Hash
      flatten_dict(v).map do |h_k, h_v|
        h["#{k}.#{h_k}".to_sym] = h_v
      end
    else
      h[k] = v
    end
  end
end

# test = {
#   'family' => {
#     'father': {
#       'age': 500,
#       'name': 'joe',
#       'job': {
#         'title': 'chef',
#         'work': {
#           'place': 'ny'
#         }
#       }
#     },
#     'mother': 'mama'
#   }
# }
#
# puts "flat: #{flatten_dict(test)}"
# output:
# flat: {:"family.father.age"=>500, :"family.father.name"=>"joe", :"family.father.job.title"=>"chef",
# :"family.father.job.work.place"=>"ny", :"family.mother"=>"mama"}

def override_dict(target, source)
  result = Hash[target]

  source.each do |k, v|
    if !result[k].nil?
      if !result[k].is_a?(Hash)
        result[k] = v
      else
        result[k] = override_dict(result[k], v)
      end
    else
      result[k] = v
    end
  end
  result
end

# a = {a: 1, n: {x: [1, 2]}}
# b = {b: 2, n: {x: [3], z: 3}}
# c = override_dict(a, b)

# c => {:a=>1, :n=>{:x=>[3], :z=>3}, :b=>2}

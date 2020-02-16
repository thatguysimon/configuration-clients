
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
# flat: {:"family.father.age"=>500, :"family.father.name"=>"joe", :"family.father.job.title"=>"chef", :"family.father.job.work.place"=>"ny", :"family.mother"=>"mama"}
import random
from copy import deepcopy

def clamp(minval, maxval, val):
    return sorted((minval, val, maxval))[1]

configs = {}
configs['market_size'] = random.random()
configs['design_quality'] = random.random()
configs['complexity'] = random.random()
configs['share_aggressiveness'] = random.random()
configs['core_usefulness'] = random.random()
configs['enjoyment'] = random.random()

# Hand test
configs['market_size'] = 0.0
configs['design_quality'] = 0.0
configs['complexity'] = 0.0
configs['share_aggressiveness'] = 0.0
configs['core_usefulness'] = 0.0
configs['enjoyment'] = 0.0

def get_results():
    results = {}
    results['understandability'] = clamp(0, 1, configs['design_quality']/configs['complexity'])
    results['value'] = clamp(0, 1, ((configs['core_usefulness']+configs['enjoyment'])/2)-(1-results['understandability'])-(configs['share_aggressiveness']/4))
    results['stickiness'] = (results['value']+configs['core_usefulness'])/2
    results['virality'] = ((results['value']+configs['share_aggressiveness'])/2)*configs['market_size']
    
    return results


highest_result = 0
highest_configs = {}
for i in xrange(1000000):
    configs['market_size'] = random.random()
    configs['design_quality'] = random.random()
    configs['complexity'] = random.random()
    configs['share_aggressiveness'] = random.random()
    configs['core_usefulness'] = random.random()
    configs['enjoyment'] = random.random()
    
    results = get_results()
    result_sum = sum(results.values())
    if result_sum > highest_result:
        highest_result = result_sum
        highest_configs = deepcopy(configs)
        print "New highest of %f: %s" % (result_sum, configs)
        print "Results: %s" % (results)


for config, val in highest_configs.items():
    print "%s: %0.2f" % (config.ljust(20), val)
# 
# print "==="
# 
# for result, val in get_results().items():
#     print "%s: %0.2f" % (result.ljust(20), val)

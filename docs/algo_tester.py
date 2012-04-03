import random

def clamp(minval, maxval, val):
    return sorted((minval, val, maxval))[1]

x = random.random()
y = random.random()
z = random.random()

configs = {}
configs['market_size'] = random.random()
configs['design_quality'] = random.random()
configs['complexity'] = random.random()
configs['share_aggressiveness'] = random.random()
configs['core_usefulness'] = random.random()
configs['enjoyment'] = random.random()

# Hand test
# configs['market_size'] = 1.0
# configs['design_quality'] = 1.0
# configs['complexity'] = 0.75
# configs['share_aggressiveness'] = 0.75
# configs['core_usefulness'] = 1.0
# configs['enjoyment'] = 1.0


for config, val in configs.items():
    print "%s: %0.2f" % (config.ljust(20), val)

results = {}
results['understandability'] = clamp(0, 1, configs['design_quality']/configs['complexity'])
results['value'] = clamp(0, 1, ((configs['core_usefulness']+configs['enjoyment'])/2)-(1-results['understandability'])-(configs['share_aggressiveness']/4))
results['stickiness'] = (results['value']+configs['core_usefulness'])/2
results['virality'] = ((results['value']+configs['share_aggressiveness'])/2)*configs['market_size']

print "==="

for result, val in results.items():
    print "%s: %0.2f" % (result.ljust(20), val)

# 
# 
# print "x: %0.2f" % x
# print "y: %0.2f" % y
# print "z: %0.2f" % z
# 
# print "((x+y)/2)-(1-z): %0.2f" % (((x+y)/2)-(1-z),)

import math, random

class Zipf(object):
    def listvalues(self, exponent, num_of_values):
        list_of_values = []
        b = 2 ** (exponent - 1)
        while len(list_of_values) < num_of_values:
            value = self.genvalue(b, exponent)
            if value != None:
                list_of_values.append(value)
        return list_of_values

    def genvalue(self, b, exponent):
        U = random.uniform(0,1)
        V = random.uniform(0,1)
        X = math.floor(U ** (-(1/(exponent - 1))))
        T = (1 + (1/X)) ** (exponent - 1)
        upper_bound = T/b
        value = V*X*((T-1)/(b-1))
        if value <= upper_bound:
            return value
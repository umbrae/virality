import networkx as nx
import numpy as np
from networkx.utils import powerlaw_sequence

NUM_USERS = 500

seq = nx.utils.create_degree_sequence(NUM_USERS,
          nx.utils.powerlaw_sequence,
          exponent=1.9
      )

disconnected_graph = nx.configuration_model(seq)
graph = nx.connected_component_subgraphs(disconnected_graph)[0]

import pdb
pdb.set_trace()

edgelist=[nx.utils.powerlaw_sequence(nx.number_of_edges(Gcc),exponent=2.0)]


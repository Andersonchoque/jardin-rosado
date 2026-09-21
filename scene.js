(() => {
  'use strict';

  const content = {
    pageTitle: 'Hecho por Anderson, para mi novia 💗',
    letterDate: '21 de septiembre',
    letterTitle: 'Este jardín tenía que ser para ti',
    letterBody: [
      'Si pudiera regalarte un lugar, sería un jardín de flores rosadas.',
      'Tú elegirías la más bonita y yo me quedaría mirando tu sonrisa.',
      'Feliz día, mi amor. Qué bonito es florecer contigo. 💗'
    ],
    letterSign: 'Con amor, Anderson 💗',
    walkText: 'Desliza entre flores y descubre mi carta 💌'
  };

  document.title = content.pageTitle;
  document.getElementById('letterDate').textContent = content.letterDate;
  document.getElementById('letterTitle').textContent = content.letterTitle;
  document.getElementById('letterSign').textContent = content.letterSign;
  document.getElementById('walkText').textContent = content.walkText;
  const letterBody = document.getElementById('letterBody');
  letterBody.innerHTML = '';
  content.letterBody.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    letterBody.appendChild(p);
  });

  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d', { alpha: true });
  const warm = document.getElementById('warm');
  const sun = document.getElementById('sun');
  const letter = document.getElementById('letter');
  const card = letter.querySelector('.letter-card');
  const hint = document.getElementById('walkHint');

  const flowerImg = new Image();
  flowerImg.decoding = 'async';
  flowerImg.src = 'data:image/webp;base64,UklGRtQjAABXRUJQVlA4WAoAAAAQAAAAfwAAfwAAQUxQSNcJAAABDAVt20gxf9jbPRAiYgL6zY09L/jk+s1TZa3F6dx66nznNpRC0eX4bAvbJkOyrT8icu3ea9u2bdu2bdv7yrZt27Zt2zYWTldmRlRcTE/1VK3ucx0RE2DHtjZFEqMWSybvgsGSiztgZp/JY5ZcaXgBY44tc5jJZmaszHivwog/Iv/I7vEjYgIwhpMEIfRxxkDpXwKsuMeqLRD3KcGSL7j7J3sA0pcEe0dPMbk/PgNCHwo4zjWqWY7+0zIIfSfgaC/U1Mws+ohVIX1GsKsX2QaN5ejFIH1FcOOhFFQa1/rdVMR9hHj4T+pK0z34w5BeRBKCSAhCXQhOqAtAD6LvBek5LKgoXIVpptEgQEey/jsDcY8RYJL1j7ritpvO2nOJsQGSwQQX+8EejRr9CkhvEcxwwc8+6BcXLw0wdyBM9a8VIlBR09yek7iXCNb+3T3FGGMR1d0fWx0IAGTssJ8XoLR2LPqFEJIQpBNJ6CxMY4JgheRttYGqmgp1v3UWCDGAxzzaDqnl8q9JBAMZ4ECoLNQ4OvfSX9RFFRDAda1/fezk3JNb3371b0c6gqACa73/5JI1jz5uWQjj5OSqW+5/+d2PzznxoE3nwhgoJ6/VgyqNjS7H+vnzH6q1HrEDRsp6/NrdP3d3PxmY58XP/lz78a39A1GzCJf90dIYSFjW+q1/Hg+L3TFQa80xql98V6q1liVOpfstxM0KuKsu0DiES6042AtVSzEzy+62rKCqZma57RsjNIIqfO546MQdCw6DHcdTUmM6WLQHII0YnOh7tThK19zGXLCr/sv4oAYRJvlzpYfqCEMQmQuOlguAG8SY5X9DgCq2bImTxqNvAGnUPEUhMiLauB8Ovj1Co+ZcZQsNqIwYuEMOvkvDpvtXLbSNAGJ2HkMuvnWjCOP9pmIM2ORjyKTiK0AaBMZnde3M70zmOGo6cIMEk3/3WHazz1K/b4EaQkEI471fi8M0cIostiqkESQAZIqLfHEznu7FT0ZoAgNT73T9+397NoHTdh2kAYKpzv3T3V0tn9NzfRMYy//gnlJWq84I2GV/ZyHUxlhghBdqdZLETnZvAr/s0epHwRaVdhfagmAQEdUgWMWT1Q+IfeKGOaV+OTwwBnIIQkMTcFlZDFLWsBXUBicv9WgAaA1voaPIUBC97XmQhtMqUyiHHXHdU+9/9e1X7z95xcErjQ8Qd0WY6FfXeuhBQ4fWWVLHv798eUC6Ycw0umzK5s5slmVZSyk5xZjd/dHFwF3NHq2m/IZ5G3NMno6EdDPdCB8TCJSAnaiaJfVjwJUI4/1QEwn07E8CiMzMNPmC4CogvOzZlLRMQDGdFIejH4BQKeDCMg6Ahh4RGUqbNr/wo7sQbOypSjZbMtnVoV0QJvnL1Rh6jNEAHchgHwTbdgHB9R5V3AgNNIpqz4y9gpmWi4G7WaZMGd2xiewFMPWfxgNVA+NRX0zvzIYctqBosbwdgi4Fi9maFzJNICOz8W0RuoHgorrOkR24U7T8dSJQV8Tj/bSWOfumAymFn4SA7lq4+n/8fyj699TE3bAA4SulNLCNPFTIIcqNfiQE1ZmB2Q59tRonqJBCkz0j+VstoWoCLHPLSPe1k4jimZl15DxgVCXGnLeUXsbsfM4Czb4pBFWJsN8I16RWnYBNZ6GWvhcCqhKFq92iDfFpoEElSXXEXgioShLu8UKtVzKSnfxCQCoFXOVtM1WtgZ0xybS4fw4IDSbYx9s6iSHIoiMNKpCk9e9PA9yJac5ROas6Y2PaIBinoUutVwyHdMKdXqidvfRzLAd/eVowAMH8KWsPAgQBcqDwz2cEAwHnedF7AGPMBNEKf29CJmDYZ56smRDBLpwJNlb4DWBgzmwNpedIOWYMJl8OgpU9aTNGYRLqJIhieT4CFvWs2ixGckFUwiQHLkCg1sdlUtUNbGAD4HTomExrZtnXhQg29WhmMmGQRoA8AkEF8wG1VH4YiCC41eMAOpiN0jhFgniGqhp9AwhAPPFnHo1wCiOmEin08mms8CshAMCY42cvojBrEJAZg0hWGP3tcYQGQDDf1/6/Ati4A7MZQXDuwT+ZDozOgulfqKy2e0gHW2gEp5alvjUtBIMLwvGF56TWbBgAUWkjZ2p0v358CKoysMhD7mWRdMjYQOAoqIA7zNH9x+0BRnUSYIXbR7l70iHaGoQoqo2oyBx1//vEScGErpmBWQ955l93bUJL4Aju0j85fnpAMKTCAKbd6HvNzSHCEPYQtxwLEMJQcyBgO9eGqAAi0GwkKfk2aBFq5WE4up1rggbG2Jad/CkwamZu/VRqXdjFEHer/v1wUE2C0z1ZXW7usYdfJqiLafb/qda0HQaYlux9JtQruNqjNRIYIZqvbd8PUg9hqv9Mm9ESCO4zR/ObmVFvwMEerfmwi9J91DFEVBPjOU/NY4QZxcenzwki1EuYZkSpzTPCqVr+PS0gqFuwnifVBhFtJ2DMop9Bw1B7wLP14JmJMqLlv1OAGvBRXc6OGAgs+r4IDfjC2dPX6M+CG/ClCOaQQwYdmmztmcHzPukxxpZk2MQImln0HRHmvdZThR0wYI9eqzJwURMe6hgRMCMdpSeAmSV/EjyLcS0KBICjhRGmgYDdRtWyf0CYTRjrS8+m1nEsq3uVHSqoqATagK/HAtWEgIs8WkfaXiz9xFvKVJsOUDUzwwYBRcws+det+gRLuJrqIMYp+187YHOvrfQUc86mZgqqaBMn/5jrA+NpT6pqV1Vjdr99FshEv5ZaTxl/987J1J5K7zkQahcs5SmqtVCWmNz96bUACbjQC52h/tO029z60Uc7r/KHt3MUgqJmsbwcoT4IjnEv87os60qt7r9cvzLADMZ8Oamg5CR/CYAQMMerrssAqA7wnRoBwZ7vtT08/vnrF240CUACAIIrvS2sa82Jfi61BBBB67iilpWOcc4jpwY1AQSadbX7nnjk7juvveIEgAg6Ek/6mRdqrX+DjOSbQEAEMLDQV4+1rkvBmByjnwNBMwUVKQhhcMYsz5f+5wObrFJmVMa0/HdKEDqSAEtd86e7lznGGJO6u98+LlNDQCwhhCBM6JKBBRafAuAPytXNsbwHgsGZgSm3ue7j0d555HvnL4NeyADALRzmyxY0+pYIFQAWADLjcpvsuMcOmywzHQFMPQDEQiCa6GeLMJTLb8YhqgSQCKoGQQ8NOKguKgNGPxgB3ROLhBBEmNBTicf+UV3Hin07HtEQ9G7BzWUtjCy+GQT9VE6eqf8DOod6AwT9NeBCb+dBCn9rXKY+Q4IrPGVTMy383anB6LfEOMk9xhzNn54CjP5LjI2+dHcffYKA0ZcFEx781CvnzA0Q+rSgo6B/U2AKjP/rAQBWUDgg1hkAAFBVAJ0BKoAAgAA+JQ6FQiGG3p24BgCRLYAZC0Kf3L8Zu3u+P338bvZerL9E++f5AdP5Svk2+R/r3+9+4/33eov9Cf633AP02/2/98/uXYH/cH1Af0n/G/8v+0+73/s/2q9xn9Z9QD+Zf4T/w+ud7Bn7ZewZ+4PpeftX8D39U/1f7R/AX/PP7n/4Pzz+QD0AP+v6gHYJ/zv8AP1N8ZP7Z+LH68+pv4v8n/a/1+/0v9t+Fz4cw/9GP+N6IfyP7hfs/7l5sf8XwN9/3936hH4//O/8j+avttfO9njY7/peoj7l/Qf9d/h/8B/4P8z6U3956LfX//je4H+rf+08pfxCfNvYD/m/9n/2v91/MD6ZP7T/y/6H/R/uL7ifzf/Df+D/J/kT9g38m/ov+v/t3+Y/9X+a////3+8z2R/tH7IP6svDoGYeO8A0/QVE5OdPpvgyAYUiE2ZqWszl5mr/ClDKs3y0qdLN1VOELA7ZlGdyL6xcczoOGWnfFBCaQj9WFYDW90U7i+3AfGTyNMelG71qdG4zBnuldKv9XwlSGfKH/Qk62lBxjWV/zf5agr6RLJWcA44b50c2emoZJovhX/0tsn3n7SDAVY0nTW/c7ordUy7AGOTOBxO/33xeMzD+mo2mEQbfuXAWN3SYDaUEyA0KqpcmcpZJx318H6ISWhCbd1oNrTQCzTVnfE/+PyyMVco79pbINcgtCNgG+nIV2mpu8du+IPJM0Z4dZOsyee3MZBG3ZnZRMY/wuBML3ZN4fRR45O8r8fvXq3lZ8X1VbwfpTkUYVg7k4st2UrFhYr1wQz2gA6lmveGlv9yI9J5w6KORZsZN8njXm/kks0ek1WlHbWPA8IupXnP6LodLLvYSGCn8tomeFhUaW+3T/jl/OytOjO9pRVALWUuUnzgCfwKBsb51IggA/v+rUI7fPzAJYpwT7vzSBeOZGRujFxwHtAQQkZeruco/YmzZN1zFFlnhUYAyvpWQFijfdlv0wFoV7Fn6HrZjrDQ6Oe868u606JptjZomUrRQHSHjS1genFX9XvQNv1w53mFyuA7iXt//gus+hwpPH5i76x9BOurmD34A8VCRKJlqCDuu3ngdN04NhUWDOPUf8qgk1OFbVPINufxIJj9gyvIihkfP5s4LAFPZB86diuvIKhsrXed15i2XLXS/pN76EiisNRifz/DSpn7Yk/dpsewTqxv6nj2TeJ7XQjrvOBEGvXEtmYxRJufvkNy5gjfCXY7RU/ZlY3jShXuqL9AUATr7do02bRRnNd1GJIhhEfHiBGLakgpl7xSpN3XnyXjQPyFLQvZEuUoIZAa0/UcQGeRrPpKbx1fEjnvW7v4kVLH41y74/Uzz/L6GYKa231zjyt0/bd8WymNGz2Au/PiVF7xcQLIpkBcLIvXaeMtTUn8YxtEKf/xmXitfO8zUxz+BYlPYBjtD3H6kt6r6oC6OlI9LmZsSjqAoOWtKzJjck2OGivj3TP2gnHosls935LVlJcPLX8i62dzSvTRRaPaQ5xRe68V21j2tS6yANn8GwC76USaTBUaPgWCL/iPIyDTy8rTojFeYQqf39BhcBw15NTs8LzRYhqAMDFZaTPtrEFsmNlCWf1oWEX0aKaYouK3x43Og0Xm+yciAvwz1E4QIcmNNZf5M3zGeGHiM/SXDdC0lHMj+8nE8spP7/vVV8fv/CvMKQfjntFzg6H1Kw3lonfRhJLks5d5gUPsEpiFrUgUZm5wQACoNh96bHipOJ5Ly/dw7d/LI0O5ECkRfLZtTgRSLqmKdLT7ZGN4oR8EkoHxUkec6+3f6AuN5cLlHp/uUP2QcQnIpQSVDKZ0M9F10XfsLfWdHNquA8Cb51XeOhrMurhzMRR9ovc8WwD9HR0AqdzWGSGZUKSUtapr+YvFi3JqM5nKL7EDtnxEhuBEuDqIz9bmu8Tztvgek4iaK29gH6Cm3noX/oUD0LEIexwh3WOnQR9Ojuz79diLZJmFzQjzI9UNX4A091iF9UYcoJFozsgA5Z09KmoE7+tT8Y7YxKx7BZ4b7OwpnBBhrnZYWRjWh1dJrEryaaC4dWsjidm2OjBh5exAn8AWXrQ23p4+L8+NaYY8jJWW7NyVlhji5JH/zo7wtkQDyAchKm20xeKUQTculb58qJ15oissj0fsV9XPR8I8UIjFieMjuq1R2ZKC0IuH+NzLi8DVT//ayZziNRS5qJLEESes9a4X5jN67SVUR8Syzc5hZBn6AckMjQmwltKG3v63HaWXILkn/6qRvN3rpn5ou4J31Bh8FE2S4CzRzZDsmLHNwCx5RcdBGvr3cT4Y8fJk8yqJblEEHIENz6lftONpDkUsPlWx7SV5EcKeSQ0YTrUmwWaJfcVRzT9d16CUuzBDowCU2SxoxjHine3tlze51Z3oEApRqmPZYmaIDuQ6AC/V7wzyr/LkFrX6r5uHgAF0RhLd/9wa940jOryTVklJO8OUgoquZunCG1rGPNRpyg9mDYbPu4+cMd592E1KfvfbbA6Ry2WsSihAez38RV7noluNmWouq+d/QTw+k14M7/XPBHd5pim3AMUZPKLcsDkLtTdpySn+3UsUq/1L0VqyUe0YeWtmESfAkHGGLO2Nzugak015LjMPkjc5X9VbLOaFqQLIO4e0qpLVZG1uJHAEZSGQdPdxiUR90xFZCPYquiu1T25GtWpTR/OPPQi4APfn1yLCJ6IKctEhWGCj2ZfthXxIMJwDupSMXrd3WnY02Tq6Q0tM3qEoh+yK5JdMbIZFyUAHy4KSxpEV6X11AT+B2rgrShJNdtWRDK1j47vGnaufQu5pIUNjk1tRZYhUNJybRbw+kfJYR1b1Gma2n4z98bi8zx90nvbfbUgtwVeNx/1WtW5x+JwyShm5WzAx0iDyUqN13BD98BKzU0NLdmWvD8rd7F8pCEj92pmIrKA/RZ+NVTWYUVfGCBwAhoehp1uw+Xgy9kbTHSr17X0XuufIP56voGgCtviPgc12A7moMPpgpYhPh8kTa3WybINzLlFqXlRJWwUK3F7qQCW71zu+BFvHe2xMKKfCCoETuPiI+PXqttkLUDeVsKAGEdrds+rQqU7iev6hhCs0qGAviA6/p4KOdnQRrf0IF7QbG5MNMWELVbkO+2hKcGNbyd9Mut6yAILv+v6QX33BvE6AIalVnpexBS3Nhy6BltuFh8C/pJctpFOJ/LNdHWImUUV8Qb4znydHvyGQWHRclrJVocAeHVHq5uiTpeeeBTQ3THnXiJXPmymhF1ipwfR0JyvHCiLgXWtwHxX6mFx14DRW+9QqOgGeKBY5VEUfhhgCSqfNS2sjLcIRcwe2epzxybE/Ckd2TYCnPyeFLzrzDgZqe0HNfPvJvZNZpL1O4hsKo44EkWjFt0lZqS5kKKkIVdxbHb+GjTYfbj9aNoCWmc0oX6yJBGmh6LTVnhV297jgyGbiWuSkjy9vlMax6ZsoaugrG5JWNXtyY4azYpQ/MJ09oRq9+EZQu3B24jbELIxCePJ1WIG9TEpPrJzxhhYJbSvMRhfBW5FQdcNHdw5svrEbFEb244Kna4HaQRvKAUZNaI3ztojr+m/he+WgApfkDG8o/uFcQP4PZw82TGxvPppx/0KSRwgN9rHDM2Wvgh73Z8SYwlrjLfUXy88hZ8azM4yI7myfP+mer9p60FCGtGWoqIJkmvPMqt9ObH0qmAEwYxb11cjaQJLVggEP0N2endxay3IS4LKeWeau9Rznqfh0iG/xh2tIyCTuiZX5FSVzvR9XnxtJ+CeDqMMpJ+0X2mTXQigrvf6PSBR9CdBu7SgaIdvZcvmQwMORTImOmhigH2H80yll2Dj4MG4Fz3U2DBIpyHIsmvNtBgkhonNSpvBVgKpENCgo6nV1svL/JFgIq3dMRbh8SKeqH/eN+vWC45PqfbEXsPJRWtyPLJUeqNkzWoTxSWPVv6n7TpDle53k05B2Hn4hGYaxPe2ztrAWhu9FSBfeZ5iTrUffQ0cRbiG7lPD7vb75NKtyqNENy5R0MeiY1zVTHf11IzkAwBypgLMZr2ijf3JhxR7eDzsDt/BrlVFRJXKjzHvELCzQEF21+r1vCvLnDGUqkhmtYaJxwAAyQ+VYPPRYQ6JvE6JKpuh/5EZpFbXVzhx5S1wAE6Djx5MOGOijd11LdhCd2hAbzIA2XsaC8av8UO9fQ4CbKpCfq2gXBtQTSja1GmIfJ8FaJrnrwBDWQw35MZ+eViZCFDseyIFzQY9EnQHwLqw+pzLv/WfPu/zdRYcY/xEm/CNQxez3XkUSTKyF/Z50uYFVEcl/DS7YTn95qRpYutvoTtQp/dQjbMunXQ9ytwfhgWoD/KxIoyt47Au79nIocDJiMMY6N9A5FqEaPZupqSkRIK5VR9kvmxkaE2N/hj6vjdQ72BNVMtny4gWQVk0GwbvyzUbgTJRoczaa9hreHEMjUu5N13mE+oWLUo6DZ5AEad+DLyB6jDnjWYOpANOMu/c8ywONpWFenAiYsiJpBRh149OkrFtPFsmQOR0OPBR/wNNArs8EMpwidxJT5fKKBvcv+puzcLFyIZZdYpYhr5kqhTVxS7JHgjvtU29Dzb4gWbPv7hxs0BpXNRzVNWyaZUVSS+E4pPBjXb2vBgucqpJe6yAYLl33v5JIywQ22ut9oKjEDQ2KU0G0ftEAvLgMYocKl2DOSLKD69D1g9B+VRdrKSjdRyRci78teHxxYEGfF0nWOTLbp39bM+rcs5gKqB9WnzSpzcVWpnzOkifSgZ/6b2mXn80J0E/tOSqoj8OGHA58FPOnud4i4dUlSzmCJ8kyf2LvUjQavRnAsTIlzNTZM3FzNZVYoXGuAOcXJEurPH/nVMEUDN0S8phSof0sSMzqqnosi9NzgChHE+184k1RwDxGhSi3d/V6/mTvSwH+gfD8JGktScAl9psVeBHGkEcxt7rZgdkh3fH+UtNM3DmpZRvz4m1RcUNj78IyilHruUe7nbWLx9pInZhn5twUhZ2ZN1qH77YORLnae+GZ3cTWbJPOLS+zM20rK+6Gq0HY4oMxBPd5oKA2YS+KoHbEpSjyFwmlRTV5x5EJa5kIer/8KcMNFhuIkLKU2l2Vu0dJRieow0AAZKIQ4IJRGv1Q0rhJ1ZGBWmZxByv10bcYdVvMn/HANydjclkHbDcKekMefuGnHNoYMaqMCByo+oxvNrTluXDudKLwh5eDLbezxv+jfeWsVVtNsIm7896U4bZtG0ePxXPR92MemPCFRA9uzK1spWPnpP9HVgrPP4sgGJSu/AKKYt3gQvn2f7Wnuxe2VKPFdcYxPM2D6RUNlrJgj3ael9+RdM/qMI4xEs1eiTXslZRKtFuaIw+bjzDwjhLRCtub5qsNvJZ+0dhGlub+ufw8N9b5uPqCw/8Dtm7d2GJPT1hs3cUIDLS5/CX649rH+tiFtbhz47lEjVrvgD/Kl6UdxSArjBrL6Zru3rzJMcT9t+zs1QAOeXvo6D16jSJfJq2uMv4t26bFsPJRMe7XxMFsZSUKtEv6LWxX81jAK/eoh0KaCSRuJChkDByeSxp9PgOGbC2v/IfNwHGGZgscBFWoSFEuCusXnv5gSp6S1XqH7aZMsCFlFLhTVPQxEBXhgS8IveQ9Al+5l5SJESncYbGPgCECynZzWkLokWWWCsE7e/Ik1HYaW1wCBJwBcScu5ct3RcLh6F4h5kSr5OUz+W5SkaorATyVkPhX5ZSNbHURPL5Inq5YEAl4H5GwKdWpsTWGAFaqoyWnelUAM8tkdRwgW7DI/1r7BGuTAge0Msdd/ssGm/wIKmvJ41LgZj8dLqds32zvpiT29fNm0KB1IzvKRLRvYgz+mJsMZPzaA8clsMEXihY0ROCQ/W/vYpc8Gc2I7+DnXGeBuDnkpO8uHdzsG+RZ95dxYC7bZOwUEzH7BelHdDoHoPuaj5R4Zo3HNcahGTNhpilVWUpQu7TTwmHd6yb1tzaxOOzaS66O0THqsV4H8ZwGanjmzaB093frMWf2AKvo4/Hw9BqaYGkgkrTBUSZlh/02D9LQFS7yojcLWvnSwAspyBi1CGJ0w4JFUZQhNc27b+HPU6WyMTx3xIUqzIqV3eRqjhA3Lxr45/iLxTYCa9A1dQLSiPtnhG8JUC/05M/5wjgU0/pD3ujL08xsbogNC4Hvhseh3ihLuOoKtQg2XTtPXjXi2g51TzCG6czZHJfgxLIu/6x8o+l89TbuuuiVu8VdEmOZcpjlcoKUG6TMcP2cSZhrdaPjHts2Sx3bxdzsupqwX2adBBv0W2tBKcQ/8PEU8TcuSa72t3Dnn/FSM8Aon3+9yV+T44Ro9GfSTAwGJTf5zYV28DRfdMa56XKqDweEW7d3O8ToAwabcOPN2WNH2NI8pyQQBhyaw9dp5Eygu8Db/Vj3ZiAIM/Axg9uvnTSYPYW9U4dMRJDROZhza1WSgAHuC7FUa1Th4pomM1F0AY8dJ5Ybx4gs/6T3sXMdMnw+0Mhg6xr0g/5SNKsNHZfBY0KJMwzDvKVz/vVfv3RkOJk5txi21ZkNHBpQpJLhd/YA++VbvKZ6O5aZk+TByoSVJ4mZP9WMOMdMwerMBnw8VjA79NtUTWGpGteVV11Z6F8xCZu4g73YUFRiP3omBD8eEqLXsohrz28wS4xzh/zcgb+UCdYZnQ5UNzwwT4d91zs9Sj/VJWZxrNlDXcPobrDN5j3Kc0ls0Nw37TJHBX1j5RI/JQ8+5fUv0TXfonL0Zjm/gA2sphyJqi1JdOybLN2b9C5YcYOreWDTgmrPWcmPjOKkcDpUVcSLTomTtSNYVvq4Pcv60V6RbBM94VAIODdvREsWEiwv5lc2Mu9eTy1fO0i/LF+JGhzPuayZmfgX/XZU2SJoN0iyOMCjdC0kM+tm1orSaVFFw7IrhYxlrrFK1ErbScjs4dLvOCAa+ysLBjWm6WiRuNf6aRmqeTGiLcI/K5niKkjJvPvVtoGFWL4vzVoDWsponamo6/mdkh4vkpUfzjY2LO9LuA3RRYIx3k7lZyJm1/HhtIfdWJ1I0qBCD9W0QoP69xxPH9J/oHuK33VqS6jW54fphX7ZVtkd/ctXeXgEcwAETaDqIVtBEkoJcSZZbaQQdzb1O8KADA3KjPZTC+TBx7ks6bfr9LrWrIWhfZNkP8S5ZYxBV959yEPDD+4aEM078sH4gqKD3/99WgPrunlBbUaBe3uj9fdsyTq04SRn2Zht/yIg6XIaHWBypPUv+uoCiZwBkm7ePJDTqenOlEgicRpi5eN1Oj+cFyUQafVP2eh2e1WOFjEeNfVRWzL9zVEWeLVREdyXg6GZy5tVgWbf5YTmfXO9SQvhCJh7u0ZQ3YgbLZQIrwnJDz9ptM2lE6vpbs4T7TrfMJXA4VHHuJmdbgIt9x4yv3M07xPZ6iPzSgtwerjQEX3W5o52CUcCI0RSHe1bPSaO1LTQHlbjchjXr59CnToOjkacnWjAZyIU7QCgSJUYwuAdRglugd+HH4VZmfdVotrxD0V4mgyAWg6v6YXGI9FeFlJ0uQ/c5W3yyM0zDNtqp/0fmXploetUEWMwEhxlC2MW6YzupJHK1QanIWKkuIP4qfnAA3UUNMpswD3CXgnx45BA7O2Y3JMvBs8id9KmaQ/x4cciuaPcVDvRfKuOOSMhmCk47nbNZe7VJIPcP82irydtInT/QAjjfhmZsxaZIvvjg/viY1/mT1OmOr5kNyHxZWxIqXNr62QL+kVFISHLT+F+LLmuftye+MF29/PAk+jiiQT3rZD8ppP3Z/3mWnl5FWbZ9W+rSU1HlZHeHh+gz5IrXfK5IPdHAG+CssuyQt7lWgAiWvrHUY9a3tTHXQEvmUlZFghz44Lrd5LM/wmQsvmOIz3m8loO3TitZFL3sPjCan2AGsAGfUVNUjxplqvdjLTp11FNSWwD/ToFgsjwgCfrg7q4Wj9SHE5F3nqojkOONwpy5c3EJhhk4Q+zUjY/tXH94KhG5rFEjnR+IS9oJxaVgBppz/HSfLGOWnDwGbrDK/tYYiVx0JEK71UJava8VkG0JODV4cEZFQdh5ZbCwVucyZtBO0yRlexABXdO/oUcPPqqST3jjNB/b+wAe67rwNJc+qKBvD+BmVlF6h6Bnk4ObHqFOoFX+v6c4411c/ELj/8EXn5OYFLyGe5b0bp2MxNht/kuCqqctb7FaLHquWVlvW80DJSkl/20qUXpB/DluFQgsMQDWpb/t5Pmfm9+gjVf2w4L4DfLjPaqsKIpEgAxyAo98KqvvwVhNoG4rJd71SlMbSR1V3GL1s+t5OOsr1mX4Ep1ttUtoqYZSXAPLvk5q3vd9bTMYQS+15N8+8H8wAEQr8nFyjb6BGLWBHmqdmDadQKY8hyWF+sEejjMa5eImDKG7WVUOkz8zt5dVV9aoUjAo3CbBDcX4qWc0/aUAtPw1adyrQWW1oKFR9XGcoKioZ5YKVF0yK56KY+o2nHX9awEiwU06xuy7neg1FjImLLe1qMKzFLnJitZKX4gd9Bs+QCwPXvOeH6O1O9bpQfpov3O8jZsdgKa5BWgWqUlxZ4ymvCBBF19jjJo0WnoCAYIvgYOa35RWXDEddluGIVbyX6zoL3ftp3NaUp0sEtYc7QEW/9c/pwQG6Rswqg3Cl2e8s2n6H7N790TDMyrAPjIRObMkUkAHUGpLve9WzXcnwLRvWuQCBV+VaKPrVp7qhlO614NSS8uWwpp2Ekt9zN+ZlD1w97YT6wdgJdw0ojtTzY5tenIZux4qSAywIKmPpIQLufcSrwCHv6T3uOemxixTYDWsN95WpU8cOhNKyhp/k7kesRf9wZjnE1Kp0ZvjAAAA';

  let W = innerWidth;
  let H = innerHeight;
  let DPR = Math.min(devicePixelRatio || 1, 2);
  let progress = 0;
  let target = 0;
  let dragging = false;
  let lastY = 0;
  let flowers = [];

  function clamp(v, min = 0, max = 1) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) {
    const t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }

  function seeded(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  function buildFlowers() {
    const rnd = seeded(20260921);
    const mobile = W < 620;
    const count = mobile ? 38 : 54;
    const list = [];

    for (let i = 0; i < count; i++) {
      const depth = (i + 0.65) / count;
      const side = i % 2 === 0 ? -1 : 1;
      const jitter = (rnd() - 0.5) * 0.1;
      const lane = 0.28 + rnd() * 0.58;
      const sizeMul = 0.9 + rnd() * 0.22;
      const swayPhase = rnd() * Math.PI * 2;
      list.push({ depth, side, lane, jitter, sizeMul, swayPhase });
    }

    list.push(
      { depth: .48, side: -1, lane: .28, jitter: 0, sizeMul: 1.05, swayPhase: 1.1 },
      { depth: .52, side:  1, lane: .31, jitter: 0, sizeMul: 1.00, swayPhase: 2.4 },
      { depth: .72, side: -1, lane: .42, jitter: 0, sizeMul: 1.10, swayPhase: 4.1 },
      { depth: .77, side:  1, lane: .45, jitter: 0, sizeMul: 1.08, swayPhase: 5.0 }
    );

    flowers = list.sort((a, b) => a.depth - b.depth);
  }

  function resize() {
    W = innerWidth;
    H = innerHeight;
    DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildFlowers();
  }

  addEventListener('resize', resize, { passive: true });
  if (window.visualViewport) visualViewport.addEventListener('resize', resize, { passive: true });
  resize();

  function drawLeaf(x, y, length, angle, alpha = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha *= alpha;
    const grad = ctx.createLinearGradient(0, 0, length, 0);
    grad.addColorStop(0, '#244817');
    grad.addColorStop(.55, '#3f7628');
    grad.addColorStop(1, '#6b9c3d');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * .46, -length * .24, length, 0);
    ctx.quadraticCurveTo(length * .48, length * .22, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawFlower(f, t) {
    const d = clamp(f.depth);
    const mobile = W < 620;
    const horizon = H * (mobile ? .455 : .47);
    const ground = H - horizon;

    const travel = progress * lerp(7, 34, d);
    const baseY = Math.min(H - (mobile ? 18 : 22), horizon + ground * lerp(.08, .92, d) + travel);

    const headSize = lerp(mobile ? 18 : 20, mobile ? 76 : 108, Math.pow(d, 1.08)) * f.sizeMul * (1 + progress * .05);
    const stemH = lerp(mobile ? 22 : 26, mobile ? 118 : 165, Math.pow(d, .98)) * f.sizeMul;

    const pathHalf = lerp(W * .035, W * (mobile ? .18 : .145), d);
    const usable = Math.max(24, W * .5 - pathHalf - headSize * .62 - 10);
    let x = W * .5 + f.side * (pathHalf + usable * f.lane) + f.jitter * W;
    x = clamp(x, headSize * .56 + 7, W - headSize * .56 - 7);

    const topY = baseY - stemH;
    const alpha = (1 - smooth(.82, .985, progress)) * lerp(.78, 1, d);
    if (alpha <= .01) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(0,0,0,.16)';
    ctx.beginPath();
    ctx.ellipse(x, baseY + 1, headSize * .38, headSize * .10, 0, 0, Math.PI * 2);
    ctx.fill();

    const sway = Math.sin(t * .00055 + f.swayPhase) * lerp(.4, 1.9, d);

    const stemGrad = ctx.createLinearGradient(x, topY, x, baseY);
    stemGrad.addColorStop(0, '#4f812d');
    stemGrad.addColorStop(1, '#274b19');
    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = Math.max(1.2, lerp(1.2, 4.4, d));
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + sway * 1.8, topY + stemH * .52, x + sway, topY + headSize * .14);
    ctx.stroke();

    const leafLen = lerp(9, 34, d);
    drawLeaf(x, baseY - stemH * .34, leafLen, f.side < 0 ? -2.65 : -.48, .92);
    drawLeaf(x, baseY - stemH * .56, leafLen * .82, f.side < 0 ? -.42 : -2.72, .88);

    if (flowerImg.complete && flowerImg.naturalWidth) {
      ctx.save();
      ctx.translate(x + sway, topY);
      ctx.rotate(sway * .0025);
      ctx.drawImage(flowerImg, -headSize / 2, -headSize / 2, headSize, headSize);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawMotes(t) {
    ctx.save();
    ctx.globalAlpha = .35 * (1 - smooth(.75, .98, progress));
    ctx.fillStyle = '#ffe2a1';
    for (let i = 0; i < 18; i++) {
      const x = ((i * 83.17 + t * .007) % (W + 80)) - 40;
      const y = H * .53 + ((i * 47.1 + t * .003) % (H * .42));
      const r = 1 + (i % 3) * .55;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function render(t) {
    progress += (target - progress) * .075;
    if (Math.abs(target - progress) < .0001) progress = target;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    flowers.forEach(f => drawFlower(f, t));
    drawMotes(t);

    warm.style.opacity = String(progress * .72);
    sun.style.transform = `translate(-50%,-50%) translateY(${(progress * H * .045).toFixed(1)}px) scale(${(1 + progress * .08).toFixed(3)})`;
    sun.style.opacity = String(1 - progress * .18);

    const show = smooth(.78, .96, progress);
    letter.style.opacity = show.toFixed(3);
    letter.style.pointerEvents = show > .55 ? 'auto' : 'none';
    card.style.transform = `translateY(${(22 * (1 - show)).toFixed(1)}px) scale(${(.95 + .05 * show).toFixed(3)})`;
    hint.style.opacity = progress > .035 ? '0' : '1';

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  function overLetter(targetEl) {
    return !!(targetEl && targetEl.closest && targetEl.closest('.letter-card') && progress > .75);
  }

  function addDelta(px) {
    target = clamp(target + px / Math.max(850, H * 4.9));
  }

  addEventListener('wheel', e => {
    if (overLetter(e.target)) return;
    if (e.cancelable) e.preventDefault();
    addDelta(e.deltaY);
  }, { passive: false });

  addEventListener('touchstart', e => {
    if (overLetter(e.target) || !e.touches.length) return;
    dragging = true;
    lastY = e.touches[0].clientY;
  }, { passive: true });

  addEventListener('touchmove', e => {
    if (!dragging || overLetter(e.target) || !e.touches.length) return;
    const y = e.touches[0].clientY;
    const dy = lastY - y;
    lastY = y;
    if (e.cancelable) e.preventDefault();
    addDelta(dy * 1.18);
  }, { passive: false });

  addEventListener('touchend', () => { dragging = false; }, { passive: true });
  addEventListener('touchcancel', () => { dragging = false; }, { passive: true });

  addEventListener('keydown', e => {
    if (!['ArrowDown','PageDown',' ','ArrowUp','PageUp','Home','End'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = 1;
    else addDelta(['ArrowUp','PageUp'].includes(e.key) ? -H * .55 : H * .55);
  });
})();
